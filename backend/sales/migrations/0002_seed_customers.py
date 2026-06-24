from django.db import migrations


def seed_customers(apps, schema_editor):
    Customer = apps.get_model("sales", "Customer")
    customers = (
        ("CUST-001", "Al Noor Trading"),
        ("CUST-002", "Gulf Retail LLC"),
        ("CUST-003", "Desert Star Supplies"),
    )
    for code, name in customers:
        Customer.objects.update_or_create(
            code=code,
            defaults={
                "name": name,
                "is_active": True,
            },
        )


class Migration(migrations.Migration):

    dependencies = [
        ("sales", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_customers, migrations.RunPython.noop),
    ]
