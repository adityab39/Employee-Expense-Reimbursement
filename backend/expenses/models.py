from django.conf import settings
from django.db import models
from django.utils import timezone


def receipt_upload_path(instance, filename):
    return f"receipts/user_{instance.employee_id}/{timezone.now():%Y/%m}/{filename}"


class Expense(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    class Category(models.TextChoices):
        TRAVEL = "travel", "Travel"
        MEALS = "meals", "Meals"
        OFFICE = "office", "Office Supplies"
        SOFTWARE = "software", "Software"
        OTHER = "other", "Other"

    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="expenses",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=30, choices=Category.choices, default=Category.OTHER)
    receipt = models.FileField(upload_to=receipt_upload_path, blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="reviewed_expenses",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-submitted_at",)
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["employee"]),
            models.Index(fields=["submitted_at"]),
            models.Index(fields=["employee", "status"]),
        ]

    def __str__(self):
        return f"{self.title} - {self.employee.email}"


class ApprovalComment(models.Model):
    class Action(models.TextChoices):
        COMMENTED = "commented", "Commented"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name="comments")
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="approval_comments",
    )
    comment = models.TextField()
    action = models.CharField(max_length=20, choices=Action.choices, default=Action.COMMENTED)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("created_at",)

    def __str__(self):
        return f"{self.expense_id} - {self.action}"
