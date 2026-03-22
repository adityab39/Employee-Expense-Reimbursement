from django.core.cache import cache
from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ApprovalComment, Expense
from .permissions import CanEditOwnPendingExpense, IsExpenseOwnerOrReviewer, IsManagerOrAdmin
from .serializers import (
    ApprovalCommentSerializer,
    DashboardSerializer,
    ExpenseReviewSerializer,
    ExpenseSerializer,
    invalidate_dashboard_cache,
)


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = (
            Expense.objects.select_related("employee", "reviewed_by")
            .prefetch_related("comments__reviewer")
            .all()
        )

        user = self.request.user
        if user.role == "employee":
            queryset = queryset.filter(employee=user)

        status_value = self.request.query_params.get("status")
        if status_value:
            queryset = queryset.filter(status=status_value)

        return queryset

    def get_permissions(self):
        if self.action == "retrieve":
            return [permissions.IsAuthenticated(), IsExpenseOwnerOrReviewer()]
        if self.action in {"update", "partial_update", "destroy"}:
            return [
                permissions.IsAuthenticated(),
                IsExpenseOwnerOrReviewer(),
                CanEditOwnPendingExpense(),
            ]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        employee_id = instance.employee_id
        instance.delete()
        invalidate_dashboard_cache(employee_id)

    @action(detail=False, methods=["get"], permission_classes=[IsManagerOrAdmin], url_path="pending")
    def pending(self, request):
        queryset = self.get_queryset().filter(status=Expense.Status.PENDING)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ExpenseApproveView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]

    def post(self, request, pk):
        return self._review(request, pk, Expense.Status.APPROVED, ApprovalComment.Action.APPROVED)

    def _review(self, request, pk, expense_status, comment_action):
        serializer = ExpenseReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        expense = generics.get_object_or_404(Expense, pk=pk)
        if expense.status != Expense.Status.PENDING:
            return Response(
                {"detail": "Only pending expenses can be reviewed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        expense.status = expense_status
        expense.reviewed_at = timezone.now()
        expense.reviewed_by = request.user
        expense.save(update_fields=["status", "reviewed_at", "reviewed_by", "updated_at"])

        ApprovalComment.objects.create(
            expense=expense,
            reviewer=request.user,
            comment=serializer.validated_data["comment"],
            action=comment_action,
        )
        invalidate_dashboard_cache(expense.employee_id)

        return Response(ExpenseSerializer(expense, context={"request": request}).data)


class ExpenseRejectView(ExpenseApproveView):
    def post(self, request, pk):
        return self._review(request, pk, Expense.Status.REJECTED, ApprovalComment.Action.REJECTED)


class ExpenseCommentView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]

    def post(self, request, pk):
        serializer = ExpenseReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        expense = generics.get_object_or_404(Expense, pk=pk)

        comment = ApprovalComment.objects.create(
            expense=expense,
            reviewer=request.user,
            comment=serializer.validated_data["comment"],
            action=ApprovalComment.Action.COMMENTED,
        )
        return Response(
            ApprovalCommentSerializer(comment).data,
            status=status.HTTP_201_CREATED,
        )


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cache_key = f"dashboard:{request.user.id}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)

        queryset = Expense.objects.all()
        if request.user.role == "employee":
            queryset = queryset.filter(employee=request.user)

        summary = queryset.aggregate(
            total_expenses=Count("id"),
            pending_count=Count("id", filter=Q(status=Expense.Status.PENDING)),
            approved_count=Count("id", filter=Q(status=Expense.Status.APPROVED)),
            rejected_count=Count("id", filter=Q(status=Expense.Status.REJECTED)),
            total_amount=Sum("amount"),
        )
        summary["total_amount"] = summary["total_amount"] or "0.00"

        data = DashboardSerializer(summary).data
        cache.set(cache_key, data, timeout=300)
        return Response(data)
