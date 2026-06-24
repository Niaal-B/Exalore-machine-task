from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from items.models import Item, ItemUnit, ItemPrice

class Command(BaseCommand):
    help = 'Seeds the database with an admin user and initial data if they do not exist'

    def handle(self, *args, **kwargs):
        # 1. Create superuser if it doesn't exist
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'qwerty')
            self.stdout.write(self.style.SUCCESS('Successfully created superuser "admin" with password "qwerty"'))
        else:
            self.stdout.write(self.style.WARNING('Superuser already exists. Skipping...'))

        # 2. Seed initial Item data
        if not Item.objects.exists():
            item = Item.objects.create(
                code='ITEM001',
                name='Sample Item',
                description='A sample item for testing.',
                behaviour=Item.Behaviour.STOCK,
                status=Item.Status.ACTIVE,
                tax_status=Item.TaxStatus.TAXABLE,
            )
            
            item_unit = ItemUnit.objects.create(
                item=item,
                unit='Pcs',
                co_factor=Decimal('1.000000')
            )
            
            ItemPrice.objects.create(
                item_unit=item_unit,
                price_list_type='Retail',
                sale_price=Decimal('100.0000'),
                minimum_selling_price=Decimal('80.0000')
            )
            self.stdout.write(self.style.SUCCESS('Successfully seeded initial item data'))
        else:
            self.stdout.write(self.style.WARNING('Item data already exists. Skipping...'))
