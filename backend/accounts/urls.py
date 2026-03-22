from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AssignManagerView,
    CustomTokenObtainPairView,
    ManagerListView,
    MeView,
    RegisterView,
    StaffMemberAdminView,
    StaffDirectoryView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("staff-directory/", StaffDirectoryView.as_view(), name="staff-directory"),
    path("managers/", ManagerListView.as_view(), name="manager-list"),
    path("employees/<int:user_id>/assign-manager/", AssignManagerView.as_view(), name="assign-manager"),
    path("employees/<int:user_id>/", StaffMemberAdminView.as_view(), name="manage-staff-member"),
]
