from django.contrib import admin

from .models import ApprovalComment, Expense


class ApprovalCommentInline(admin.TabularInline):
    model = ApprovalComment
    extra = 0
    readonly_fields = ("created_at",)


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("title", "employee", "amount", "status", "submitted_at", "reviewed_at")
    list_filter = ("status", "category")
    search_fields = ("title", "employee__email", "description")
    inlines = [ApprovalCommentInline]


@admin.register(ApprovalComment)
class ApprovalCommentAdmin(admin.ModelAdmin):
    list_display = ("expense", "reviewer", "action", "created_at")
    list_filter = ("action",)
    search_fields = ("expense__title", "reviewer__email", "comment")
