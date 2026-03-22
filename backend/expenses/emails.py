from django.conf import settings
from django.core.mail import send_mail


def send_expense_review_email(expense, status_label, manager_comment):
    manager_name = expense.reviewed_by.get_full_name() or expense.reviewed_by.email
    employee_name = expense.employee.get_full_name() or expense.employee.email

    subject = f"Expense {status_label}: {expense.title}"
    message = (
        f"Hello {employee_name},\n\n"
        f"Your expense request has been {status_label.lower()}.\n\n"
        f"Expense title: {expense.title}\n"
        f"Amount: ${expense.amount}\n"
        f"Reviewed by: {manager_name}\n"
        f"Status: {status_label}\n"
        f"Comment: {manager_comment}\n"
    )

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[expense.employee.email],
        fail_silently=False,
    )
