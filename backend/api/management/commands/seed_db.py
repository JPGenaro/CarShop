from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Categoria, Repuesto
import random


class Command(BaseCommand):
    help = 'Seed the database with sample categories, repuestos and users.'

    def add_arguments(self, parser):
        parser.add_argument('--force', action='store_true', help='Delete existing data before seeding')

    def handle(self, *args, **options):
        force = options.get('force')

        if force:
            self.stdout.write('Deleting existing Repuesto and Categoria objects...')
            Repuesto.objects.all().delete()
            Categoria.objects.all().delete()

        categories = [
            'Frenos',
            'Motor',
            'Suspensión',
            'Iluminación',
            'Transmisión',
            'Electricidad',
            'Carrocería',
            'Aceites y Fluidos',
            'Herramientas',
            'Accesorios',
        ]

        created_categories = []
        for name in categories:
            cat, created = Categoria.objects.get_or_create(name=name)
            if created:
                cat.slug = cat.slug or name.lower().replace(' ', '-')
                cat.save()
            created_categories.append(cat)

        # Create repuestos for each category
        adjectives = ['Premium', 'Std', 'Pro', 'Eco', 'Sport', 'Advanced', 'Lite', 'Heavy']
        parts = ['pastilla', 'disco', 'bomba', 'filtro', 'bujía', 'correa', 'amortiguador', 'radiador', 'alternador', 'sensor']

        total_created = 0
        for cat in created_categories:
            for i in range(1, 11):
                name = f"{random.choice(adjectives).title()} {cat.name} {random.choice(parts).title()} {i}"
                sku = f"{cat.name[:3].upper()}{i:03d}"
                price = round(random.uniform(5.0, 350.0), 2)
                stock = random.randint(0, 200)
                description = f"Repuesto {name} compatible con varios modelos. Calidad garantizada."
                image = f"https://picsum.photos/seed/{sku}/400/300"

                # Avoid duplicate SKU
                if sku and Repuesto.objects.filter(sku=sku).exists():
                    continue

                Repuesto.objects.create(
                    category=cat,
                    name=name,
                    sku=sku,
                    description=description,
                    price=price,
                    stock=stock,
                    image=image,
                )
                total_created += 1

        # Create some additional example specialized products
        special_products = [
            ( 'Aceites y Fluidos', 'Aceite Sintético 5W-30', 'OIL-001', 39.99, 120 ),
            ( 'Herramientas', 'Juego de Llaves Torx 10pcs', 'TOOL-010', 24.50, 40 ),
            ( 'Accesorios', 'Alfombra Universal de Goma', 'ACC-100', 29.99, 75 ),
            ( 'Electricidad', 'Batería 12V 60Ah', 'BAT-060', 89.99, 30 ),
        ]

        for cat_name, name, sku, price, stock in special_products:
            cat = Categoria.objects.filter(name=cat_name).first()
            if not cat:
                cat = Categoria.objects.create(name=cat_name)
            if not Repuesto.objects.filter(sku=sku).exists():
                Repuesto.objects.create(
                    category=cat,
                    name=name,
                    sku=sku,
                    description=f"{name} de alta calidad.",
                    price=price,
                    stock=stock,
                    image=f"https://picsum.photos/seed/{sku}/400/300",
                )
                total_created += 1

        # Create example users
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'adminpass')
            self.stdout.write(self.style.SUCCESS('Created superuser admin / password: adminpass'))

        if not User.objects.filter(username='juan').exists():
            User.objects.create_user('juan', 'juan@example.com', 'secret')
            self.stdout.write(self.style.SUCCESS('Created user juan / password: secret'))

        self.stdout.write(self.style.SUCCESS(f'Created {len(created_categories)} categories and {total_created} repuestos.'))
