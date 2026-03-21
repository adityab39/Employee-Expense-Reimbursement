from django.core.cache import cache
from rest_framework import serializers

from accounts.serializers import UserSerializer

from .models import ApprovalComment, Expense


class ApprovalCommentSerializer(serializers.ModelSerializer):
    reviewer = UserSerializer(read_only=True)

    class Meta:
        model = ApprovalComment
        fields = ("id", "reviewer", "comment", "action", "created_at")
        read_only_fields = ("id", "reviewer", "created_at")


class ExpenseSerializer(serializers.ModelSerializer):
    employee = UserSerializer(read_only=True)
    comments = ApprovalCommentSerializer(many=True, read_only=True)
    receipt_url = serializers.SerializerMethodField()
    receipt = serializers.FileField(required=True, allow_null=False)

    class Meta:
        model = Expense
        fields = (
            "id",
            "employee",
            "title",
            "description",
            "amount",
            "category",
            "receipt",
            "receipt_url",
            "status",
            "submitted_at",
            "reviewed_at",
            "comments",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "employee",
            "status",
            "submitted_at",
            "reviewed_at",
            "comments",
            "created_at",
            "updated_at",
        )

    def get_receipt_url(self, obj):
        if not obj.receipt:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.receipt.url)
        return obj.receipt.url

    def create(self, validated_data):
        expense = Expense.objects.create(employee=self.context["request"].user, **validated_data)
        invalidate_dashboard_cache(expense.employee_id)
        return expense

    def update(self, instance, validated_data):
        expense = super().update(instance, validated_data)
        invalidate_dashboard_cache(expense.employee_id)
        return expense


class ExpenseReviewSerializer(serializers.Serializer):
    comment = serializers.CharField()


class DashboardSerializer(serializers.Serializer):
    total_expenses = serializers.IntegerField()
    pending_count = serializers.IntegerField()
    approved_count = serializers.IntegerField()
    rejected_count = serializers.IntegerField()
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)


def invalidate_dashboard_cache(user_id):
    cache.delete(f"dashboard:{user_id}")
