from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Categoria, Repuesto


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

        categories = {
            'Frenos': 'Componentes de frenado: discos, pastillas, cilindros maestros y esclavos.',
            'Motor': 'Piezas críticas del tren motriz: cilindros, válvulas, juntas, turbo, intercooler.',
            'Suspensión': 'Amortiguación y estabilidad: amortiguadores, resortes, barras estabilizadoras, bujes.',
            'Iluminación': 'Ópticas, lámparas y señalización: faros, pilotos, luces de marcha atrás.',
            'Transmisión': 'Componentes para caja: sincronizadores, embrague, platós, horquillas.',
            'Electricidad': 'Arranque, carga y sensores: alternadores, motores de arranque, baterías.',
            'Carrocería': 'Partes exteriores: guardabarros, puertas, capot, maleta, espejos.',
            'Escape': 'Sistema de escape: catalizadores, silenciadores, tubos, colectores.',
            'Aceites y Fluidos': 'Lubricantes, refrigerantes, líquido de frenos, anticongelante.',
            'Refrigeración': 'Radiadores, ventiladores, termostatos, mangueras de agua.',
            'Aire': 'Filtros de aire, turbos, entradas de aire, sistemas de admisión.',
            'Ruedas y Neumáticos': 'Llantas, neumáticos, centradores, válvulas, rines.',
            'Dirección': 'Cremalleras, bomba hidráulica, rótulas, terminales de dirección.',
            'Interior': 'Tapizados, alfombras, tapicería, volantes, cambios de velocidad.',
            'Accesorios': 'Kits aerodinámicos, spoilers, bulbos LED, pegatinas, protecciones.',
        }

        created_categories = {}
        for name, description in categories.items():
            cat, created = Categoria.objects.get_or_create(name=name, defaults={'description': description})
            if created:
                cat.slug = cat.slug or name.lower().replace(' ', '-')
                cat.save()
            created_categories[name] = cat

        repuestos = [
            {
                'category': 'Frenos',
                'name': 'Disco de freno ventilado delantero',
                'sku': 'BRK-TCOR18-01',
                'price': 145.50,
                'stock': 38,
                'brand': 'Toyota',
                'model': 'Corolla',
                'year': 2018,
                'description': 'Disco ventilado con alto poder de disipación térmica para uso urbano y carretera.',
                'image': 'https://source.unsplash.com/featured/400x300?brake,disc',
            },
            {
                'category': 'Frenos',
                'name': 'Pastillas cerámicas delanteras',
                'sku': 'BRK-HCIV20-02',
                'price': 89.99,
                'stock': 52,
                'brand': 'Honda',
                'model': 'Civic',
                'year': 2020,
                'description': 'Pastillas cerámicas de baja emisión de polvo y excelente mordiente.',
                'image': 'https://source.unsplash.com/featured/400x300?brake,pads',
            },
            {
                'category': 'Frenos',
                'name': 'Kit discos + pastillas performance',
                'sku': 'BRK-FMUS17-03',
                'price': 320.00,
                'stock': 18,
                'brand': 'Ford',
                'model': 'Mustang',
                'year': 2017,
                'description': 'Kit de frenado deportivo con discos ranurados y pastillas de alto coeficiente.',
                'image': 'https://source.unsplash.com/featured/400x300?performance,brake',
            },
            {
                'category': 'Motor',
                'name': 'Filtro de aceite premium',
                'sku': 'ENG-BMW3-19-01',
                'price': 18.90,
                'stock': 120,
                'brand': 'BMW',
                'model': 'Serie 3',
                'year': 2019,
                'description': 'Filtro de alta eficiencia para motor turbo, recomendado para intervalos extendidos.',
                'image': 'https://source.unsplash.com/featured/400x300?oil,filter',
            },
            {
                'category': 'Motor',
                'name': 'Bujías iridium set x4',
                'sku': 'ENG-AUA4-18-02',
                'price': 74.50,
                'stock': 64,
                'brand': 'Audi',
                'model': 'A4',
                'year': 2018,
                'description': 'Bujías iridium para encendido eficiente y mejor respuesta en bajas rpm.',
                'image': 'https://source.unsplash.com/featured/400x300?spark,plug',
            },
            {
                'category': 'Motor',
                'name': 'Correa poly-V reforzada',
                'sku': 'ENG-VGOL16-03',
                'price': 42.00,
                'stock': 90,
                'brand': 'Volkswagen',
                'model': 'Golf',
                'year': 2016,
                'description': 'Correa reforzada para accesorios con mayor resistencia a la temperatura.',
                'image': 'https://source.unsplash.com/featured/400x300?engine,belt',
            },
            {
                'category': 'Suspensión',
                'name': 'Amortiguador delantero gas',
                'sku': 'SUS-RCLI15-01',
                'price': 110.00,
                'stock': 44,
                'brand': 'Renault',
                'model': 'Clio',
                'year': 2015,
                'description': 'Amortiguador con carga a gas para mejor control y confort.',
                'image': 'https://source.unsplash.com/featured/400x300?suspension,shock',
            },
            {
                'category': 'Suspensión',
                'name': 'Kit bujes suspensión trasera',
                'sku': 'SUS-P20817-02',
                'price': 65.75,
                'stock': 70,
                'brand': 'Peugeot',
                'model': '208',
                'year': 2017,
                'description': 'Bujes de alta durabilidad para reducir vibraciones.',
                'image': 'https://source.unsplash.com/featured/400x300?suspension,bushing',
            },
            {
                'category': 'Iluminación',
                'name': 'Faros LED delanteros',
                'sku': 'LGT-CCRU19-01',
                'price': 280.00,
                'stock': 22,
                'brand': 'Chevrolet',
                'model': 'Cruze',
                'year': 2019,
                'description': 'Ópticas LED con mayor alcance y menor consumo.',
                'image': 'https://source.unsplash.com/featured/400x300?headlight,led',
            },
            {
                'category': 'Iluminación',
                'name': 'Lámparas halógenas H7',
                'sku': 'LGT-NSEN20-02',
                'price': 22.00,
                'stock': 140,
                'brand': 'Nissan',
                'model': 'Sentra',
                'year': 2020,
                'description': 'Par de lámparas H7 con luz blanca mejorada.',
                'image': 'https://source.unsplash.com/featured/400x300?car,light',
            },
            {
                'category': 'Transmisión',
                'name': 'Kit embrague completo',
                'sku': 'TRN-SIMP18-01',
                'price': 310.00,
                'stock': 16,
                'brand': 'Subaru',
                'model': 'Impreza',
                'year': 2018,
                'description': 'Kit embrague con plato, disco y rulemán.',
                'image': 'https://source.unsplash.com/featured/400x300?clutch,gear',
            },
            {
                'category': 'Transmisión',
                'name': 'Aceite de transmisión ATF',
                'sku': 'TRN-MC19-02',
                'price': 34.90,
                'stock': 80,
                'brand': 'Mercedes-Benz',
                'model': 'Clase C',
                'year': 2019,
                'description': 'Fluido ATF recomendado para cajas automáticas de 7 marchas.',
                'image': 'https://source.unsplash.com/featured/400x300?transmission,fluid',
            },
            {
                'category': 'Electricidad',
                'name': 'Batería 12V 60Ah AGM',
                'sku': 'ELC-MAZ3-17-01',
                'price': 140.00,
                'stock': 26,
                'brand': 'Mazda',
                'model': '3',
                'year': 2017,
                'description': 'Batería AGM para sistemas Start/Stop con alta durabilidad.',
                'image': 'https://source.unsplash.com/featured/400x300?car,battery',
            },
            {
                'category': 'Electricidad',
                'name': 'Alternador 120A',
                'sku': 'ELC-KSP21-02',
                'price': 220.00,
                'stock': 12,
                'brand': 'Kia',
                'model': 'Sportage',
                'year': 2021,
                'description': 'Alternador de alta salida para mayor carga eléctrica.',
                'image': 'https://source.unsplash.com/featured/400x300?alternator,engine',
            },
            {
                'category': 'Carrocería',
                'name': 'Paragolpes delantero',
                'sku': 'BDY-HTUC20-01',
                'price': 260.00,
                'stock': 10,
                'brand': 'Hyundai',
                'model': 'Tucson',
                'year': 2020,
                'description': 'Paragolpes con terminación lisa listo para pintura.',
                'image': 'https://source.unsplash.com/featured/400x300?car,bumper',
            },
            {
                'category': 'Carrocería',
                'name': 'Espejo retrovisor eléctrico',
                'sku': 'BDY-FCR22-02',
                'price': 95.00,
                'stock': 24,
                'brand': 'Fiat',
                'model': 'Cronos',
                'year': 2022,
                'description': 'Espejo con comando eléctrico y carcasa negra texturada.',
                'image': 'https://source.unsplash.com/featured/400x300?car,mirror',
            },
            {
                'category': 'Aceites y Fluidos',
                'name': 'Aceite sintético 5W-30',
                'sku': 'FLT-THIL21-01',
                'price': 39.99,
                'stock': 150,
                'brand': 'Toyota',
                'model': 'Hilux',
                'year': 2021,
                'description': 'Aceite sintético recomendado para motores diésel modernos.',
                'image': 'https://source.unsplash.com/featured/400x300?engine,oil',
            },
            {
                'category': 'Aceites y Fluidos',
                'name': 'Refrigerante orgánico OAT',
                'sku': 'FLT-FRAN20-02',
                'price': 26.50,
                'stock': 95,
                'brand': 'Ford',
                'model': 'Ranger',
                'year': 2020,
                'description': 'Refrigerante de larga duración listo para usar.',
                'image': 'https://source.unsplash.com/featured/400x300?coolant,car',
            },
            {
                'category': 'Accesorios',
                'name': 'Tapetes premium de goma',
                'sku': 'ACC-TCOR18-01',
                'price': 48.00,
                'stock': 70,
                'brand': 'Toyota',
                'model': 'Corolla',
                'year': 2018,
                'description': 'Juego de tapetes con borde alto para mayor protección.',
                'image': 'https://source.unsplash.com/featured/400x300?car,interior',
            },
            {
                'category': 'Accesorios',
                'name': 'Porta equipaje techo',
                'sku': 'ACC-VGOL16-02',
                'price': 210.00,
                'stock': 15,
                'brand': 'Volkswagen',
                'model': 'Golf',
                'year': 2016,
                'description': 'Barras de techo aerodinámicas con cierre de seguridad.',
                'image': 'https://source.unsplash.com/featured/400x300?roof,rack',
            },
        ]

        total_created = 0
        for item in repuestos:
            cat = created_categories.get(item['category'])
            if not cat:
                cat = Categoria.objects.create(name=item['category'])
                created_categories[item['category']] = cat

            if item.get('sku') and Repuesto.objects.filter(sku=item['sku']).exists():
                continue

            Repuesto.objects.create(
                category=cat,
                name=item['name'],
                sku=item['sku'],
                description=item['description'],
                price=item['price'],
                stock=item['stock'],
                image=item['image'],
                brand=item['brand'],
                model=item['model'],
                year=item['year'],
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
