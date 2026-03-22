from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver

from .models import Expense


@receiver(post_delete, sender=Expense)
def delete_receipt_on_expense_delete(sender, instance, **kwargs):
    if instance.receipt:
        instance.receipt.delete(save=False)


@receiver(pre_save, sender=Expense)
def delete_replaced_receipt_on_update(sender, instance, **kwargs):
    if not instance.pk or not instance.receipt:
        return

    try:
        previous = Expense.objects.get(pk=instance.pk)
    except Expense.DoesNotExist:
        return

    if previous.receipt and previous.receipt.name != instance.receipt.name:
        previous.receipt.delete(save=False)
