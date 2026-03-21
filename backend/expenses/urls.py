from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    DashboardView,
    ExpenseApproveView,
    ExpenseCommentView,
    ExpenseRejectView,
    ExpenseViewSet,
)

router = DefaultRouter()
router.register("expenses", ExpenseViewSet, basename="expense")

urlpatterns = [
    path("", include(router.urls)),
    path("expenses/<int:pk>/approve/", ExpenseApproveView.as_view(), name="expense-approve"),
    path("expenses/<int:pk>/reject/", ExpenseRejectView.as_view(), name="expense-reject"),
    path("expenses/<int:pk>/comment/", ExpenseCommentView.as_view(), name="expense-comment"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
]
