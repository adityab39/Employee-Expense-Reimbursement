from django.core.cache import cache
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .permissions import IsAdminUserRole, IsManagerOrAdminRole
from .serializers import (
    AssignManagerSerializer,
    CustomTokenObtainPairSerializer,
    ManagerChoiceSerializer,
    RegisterSerializer,
    StaffMemberAdminUpdateSerializer,
    UserSerializer,
)


def invalidate_all_dashboard_cache():
    try:
        cache.delete_pattern("dashboard:*")
    except Exception:
        pass


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class StaffDirectoryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdminRole]

    def get(self, request):
        if request.user.role == User.Role.ADMIN:
            queryset = User.objects.exclude(role=User.Role.ADMIN).select_related("manager")
        else:
            queryset = User.objects.filter(role=User.Role.EMPLOYEE, manager=request.user).select_related(
                "manager"
            )
        return Response(UserSerializer(queryset, many=True).data)


class ManagerListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def get(self, request):
        queryset = User.objects.filter(role=User.Role.MANAGER)
        return Response(ManagerChoiceSerializer(queryset, many=True).data)


class AssignManagerView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def post(self, request, user_id):
        employee = generics.get_object_or_404(User, id=user_id, role=User.Role.EMPLOYEE)
        serializer = AssignManagerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        employee.manager = serializer.validated_data["manager_id"]
        employee.save(update_fields=["manager"])
        invalidate_all_dashboard_cache()

        return Response(UserSerializer(employee).data)


class StaffMemberAdminView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def patch(self, request, user_id):
        staff_member = generics.get_object_or_404(User, id=user_id)
        if staff_member.role == User.Role.ADMIN:
            return Response({"detail": "Admin accounts cannot be edited here."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = StaffMemberAdminUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        next_role = serializer.validated_data.get("role", staff_member.role)
        next_manager = serializer.validated_data.get("manager_id", staff_member.manager)

        if next_role == User.Role.MANAGER and staff_member.manager_id is not None:
            staff_member.manager = None

        if next_role == User.Role.MANAGER:
            next_manager = None

        if (
            staff_member.role == User.Role.MANAGER
            and next_role == User.Role.EMPLOYEE
            and staff_member.team_members.exists()
        ):
            return Response(
                {
                    "detail": "Reassign or remove this manager's team members before changing them back to employee."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        staff_member.role = next_role
        staff_member.manager = next_manager
        staff_member.save(update_fields=["role", "manager"])
        invalidate_all_dashboard_cache()

        return Response(UserSerializer(staff_member).data)

    def delete(self, request, user_id):
        staff_member = generics.get_object_or_404(User, id=user_id)
        if staff_member.role == User.Role.ADMIN:
            return Response({"detail": "Admin accounts cannot be deleted here."}, status=status.HTTP_400_BAD_REQUEST)
        staff_member.delete()
        invalidate_all_dashboard_cache()
        return Response(status=status.HTTP_204_NO_CONTENT)
