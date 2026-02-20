import random
from datetime import timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from api.models import Categoria, Repuesto, Review, UserProfile, Order, OrderItem


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

        filler_repuestos = [
            {
                'category': 'Refrigeración',
                'name': 'Radiador aluminio reforzado',
                'sku': 'COL-TCOR19-01',
                'price': 195.00,
                'stock': 28,
                'brand': 'Toyota',
                'model': 'Corolla',
                'year': 2019,
                'description': 'Radiador de alta eficiencia con núcleo de aluminio reforzado.',
                'image': 'https://source.unsplash.com/featured/400x300?car,radiator',
            },
            {
                'category': 'Refrigeración',
                'name': 'Ventilador eléctrico doble',
                'sku': 'COL-HCIV18-02',
                'price': 135.50,
                'stock': 34,
                'brand': 'Honda',
                'model': 'Civic',
                'year': 2018,
                'description': 'Electroventilador de doble velocidad para mayor flujo de aire.',
                'image': 'https://source.unsplash.com/featured/400x300?cooling,fan',
            },
            {
                'category': 'Refrigeración',
                'name': 'Termostato 88C',
                'sku': 'COL-VGOL16-03',
                'price': 22.80,
                'stock': 75,
                'brand': 'Volkswagen',
                'model': 'Golf',
                'year': 2016,
                'description': 'Termostato calibrado para mantener temperatura estable del motor.',
                'image': 'https://source.unsplash.com/featured/400x300?thermostat,engine',
            },
            {
                'category': 'Refrigeración',
                'name': 'Mangueras de agua set x3',
                'sku': 'COL-FCR22-04',
                'price': 39.90,
                'stock': 62,
                'brand': 'Fiat',
                'model': 'Cronos',
                'year': 2022,
                'description': 'Set de mangueras reforzadas con abrazaderas de acero.',
                'image': 'https://source.unsplash.com/featured/400x300?car,hose',
            },
            {
                'category': 'Escape',
                'name': 'Silenciador deportivo acero',
                'sku': 'EXH-FMUS18-01',
                'price': 125.00,
                'stock': 24,
                'brand': 'Ford',
                'model': 'Mustang',
                'year': 2018,
                'description': 'Silenciador deportivo con sonido grave y menor restriccion.',
                'image': 'https://source.unsplash.com/featured/400x300?muffler,exhaust',
            },
            {
                'category': 'Escape',
                'name': 'Catalizador universal',
                'sku': 'EXH-RCLI15-02',
                'price': 210.00,
                'stock': 19,
                'brand': 'Renault',
                'model': 'Clio',
                'year': 2015,
                'description': 'Catalizador compatible con multiples motores de baja cilindrada.',
                'image': 'https://source.unsplash.com/featured/400x300?catalytic,converter',
            },
            {
                'category': 'Escape',
                'name': 'Flexible de escape 45mm',
                'sku': 'EXH-NSEN20-03',
                'price': 28.75,
                'stock': 80,
                'brand': 'Nissan',
                'model': 'Sentra',
                'year': 2020,
                'description': 'Flexible para absorber vibraciones y evitar fisuras.',
                'image': 'https://source.unsplash.com/featured/400x300?exhaust,pipe',
            },
            {
                'category': 'Escape',
                'name': 'Colector de escape 4-2-1',
                'sku': 'EXH-AUA4-18-04',
                'price': 310.00,
                'stock': 12,
                'brand': 'Audi',
                'model': 'A4',
                'year': 2018,
                'description': 'Colector 4-2-1 para mejor evacuacion de gases.',
                'image': 'https://source.unsplash.com/featured/400x300?exhaust,manifold',
            },
            {
                'category': 'Aire',
                'name': 'Filtro de aire alto flujo',
                'sku': 'AIR-CCRU19-01',
                'price': 32.50,
                'stock': 90,
                'brand': 'Chevrolet',
                'model': 'Cruze',
                'year': 2019,
                'description': 'Filtro de alto flujo para mejor respuesta del motor.',
                'image': 'https://source.unsplash.com/featured/400x300?air,filter',
            },
            {
                'category': 'Aire',
                'name': 'Sensor MAF',
                'sku': 'AIR-BMW3-19-02',
                'price': 185.00,
                'stock': 18,
                'brand': 'BMW',
                'model': 'Serie 3',
                'year': 2019,
                'description': 'Sensor de flujo de aire para mezcla precisa.',
                'image': 'https://source.unsplash.com/featured/400x300?maf,sensor',
            },
            {
                'category': 'Aire',
                'name': 'Caja de admision OEM',
                'sku': 'AIR-VGOL16-03',
                'price': 98.00,
                'stock': 26,
                'brand': 'Volkswagen',
                'model': 'Golf',
                'year': 2016,
                'description': 'Caja de admision con aislante termico.',
                'image': 'https://source.unsplash.com/featured/400x300?intake,airbox',
            },
            {
                'category': 'Aire',
                'name': 'Manguera de admision',
                'sku': 'AIR-HCIV20-04',
                'price': 29.00,
                'stock': 55,
                'brand': 'Honda',
                'model': 'Civic',
                'year': 2020,
                'description': 'Manguera flexible con refuerzo interno.',
                'image': 'https://source.unsplash.com/featured/400x300?air,intake',
            },
            {
                'category': 'Ruedas y Neumáticos',
                'name': 'Neumatico 205/55 R16',
                'sku': 'TIR-CCRU19-01',
                'price': 120.00,
                'stock': 40,
                'brand': 'Chevrolet',
                'model': 'Cruze',
                'year': 2019,
                'description': 'Neumatico all-season con bajo ruido de rodadura.',
                'image': 'https://source.unsplash.com/featured/400x300?tire,car',
            },
            {
                'category': 'Ruedas y Neumáticos',
                'name': 'Llanta aleacion 16"',
                'sku': 'TIR-THIL21-02',
                'price': 165.00,
                'stock': 22,
                'brand': 'Toyota',
                'model': 'Hilux',
                'year': 2021,
                'description': 'Llanta de aleacion ligera con acabado grafito.',
                'image': 'https://source.unsplash.com/featured/400x300?rim,wheel',
            },
            {
                'category': 'Ruedas y Neumáticos',
                'name': 'Valvula TPMS',
                'sku': 'TIR-NSEN20-03',
                'price': 58.00,
                'stock': 35,
                'brand': 'Nissan',
                'model': 'Sentra',
                'year': 2020,
                'description': 'Sensor de presion para sistema TPMS.',
                'image': 'https://source.unsplash.com/featured/400x300?tpms,sensor',
            },
            {
                'category': 'Ruedas y Neumáticos',
                'name': 'Balanceo y valvulas premium',
                'sku': 'TIR-RCLI15-04',
                'price': 24.90,
                'stock': 90,
                'brand': 'Renault',
                'model': 'Clio',
                'year': 2015,
                'description': 'Kit de balanceo con valvulas de alta durabilidad.',
                'image': 'https://source.unsplash.com/featured/400x300?wheel,balancing',
            },
            {
                'category': 'Dirección',
                'name': 'Cremallera de direccion',
                'sku': 'STR-CCRU19-01',
                'price': 280.00,
                'stock': 14,
                'brand': 'Chevrolet',
                'model': 'Cruze',
                'year': 2019,
                'description': 'Cremallera con asistencia hidraulica.',
                'image': 'https://source.unsplash.com/featured/400x300?steering,rack',
            },
            {
                'category': 'Dirección',
                'name': 'Bomba hidraulica',
                'sku': 'STR-THIL21-02',
                'price': 240.00,
                'stock': 12,
                'brand': 'Toyota',
                'model': 'Hilux',
                'year': 2021,
                'description': 'Bomba hidraulica de alto caudal.',
                'image': 'https://source.unsplash.com/featured/400x300?power,steering',
            },
            {
                'category': 'Dirección',
                'name': 'Terminal de direccion',
                'sku': 'STR-NSEN20-03',
                'price': 34.50,
                'stock': 70,
                'brand': 'Nissan',
                'model': 'Sentra',
                'year': 2020,
                'description': 'Terminal reforzada con guardapolvo.',
                'image': 'https://source.unsplash.com/featured/400x300?tierod,car',
            },
            {
                'category': 'Dirección',
                'name': 'Rotula inferior',
                'sku': 'STR-RCLI15-04',
                'price': 28.00,
                'stock': 60,
                'brand': 'Renault',
                'model': 'Clio',
                'year': 2015,
                'description': 'Rotula inferior para mayor estabilidad en curvas.',
                'image': 'https://source.unsplash.com/featured/400x300?ball,joint',
            },
            {
                'category': 'Interior',
                'name': 'Volante deportivo cuero',
                'sku': 'INT-FCR22-01',
                'price': 180.00,
                'stock': 16,
                'brand': 'Fiat',
                'model': 'Cronos',
                'year': 2022,
                'description': 'Volante en cuero con costuras reforzadas.',
                'image': 'https://source.unsplash.com/featured/400x300?steering,wheel',
            },
            {
                'category': 'Interior',
                'name': 'Alfombras textil premium',
                'sku': 'INT-CCRU19-02',
                'price': 42.00,
                'stock': 48,
                'brand': 'Chevrolet',
                'model': 'Cruze',
                'year': 2019,
                'description': 'Juego de alfombras con fijacion antideslizante.',
                'image': 'https://source.unsplash.com/featured/400x300?car,mat',
            },
            {
                'category': 'Interior',
                'name': 'Funda de palanca cambios',
                'sku': 'INT-VGOL16-03',
                'price': 18.50,
                'stock': 85,
                'brand': 'Volkswagen',
                'model': 'Golf',
                'year': 2016,
                'description': 'Funda resistente con costuras dobles.',
                'image': 'https://source.unsplash.com/featured/400x300?gear,shift',
            },
            {
                'category': 'Interior',
                'name': 'Soporte celular rejilla',
                'sku': 'INT-HCIV20-04',
                'price': 15.90,
                'stock': 120,
                'brand': 'Honda',
                'model': 'Civic',
                'year': 2020,
                'description': 'Soporte de celular con ajuste giratorio.',
                'image': 'https://source.unsplash.com/featured/400x300?car,phone',
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

        # Ensure at least 4 repuestos per category
        counts = (
            Repuesto.objects.values('category')
            .annotate(total=models.Count('id'))
        )
        counts_map = {row['category']: row['total'] for row in counts}
        for cat in created_categories.values():
            existing_count = counts_map.get(cat.id, 0)
            if existing_count >= 4:
                continue

            needed = 4 - existing_count
            candidates = [r for r in filler_repuestos if r['category'] == cat.name]
            if not candidates:
                for idx in range(needed):
                    auto_sku = f"AUTO-{cat.name[:3].upper()}-{cat.id}-{existing_count + idx + 1:02d}"
                    if Repuesto.objects.filter(sku=auto_sku).exists():
                        continue
                    Repuesto.objects.create(
                        category=cat,
                        name=f"Repuesto {cat.name} {existing_count + idx + 1}",
                        sku=auto_sku,
                        description=f"Repuesto de ejemplo para categoria {cat.name}.",
                        price=49.90,
                        stock=25,
                        brand='Generico',
                        model='Universal',
                        year=None,
                        image='https://source.unsplash.com/featured/400x300?car,parts',
                    )
                    total_created += 1
                continue

            created = 0
            for candidate in candidates:
                if created >= needed:
                    break
                if candidate.get('sku') and Repuesto.objects.filter(sku=candidate['sku']).exists():
                    continue
                Repuesto.objects.create(
                    category=cat,
                    name=candidate['name'],
                    sku=candidate['sku'],
                    description=candidate['description'],
                    price=candidate['price'],
                    stock=candidate['stock'],
                    brand=candidate['brand'],
                    model=candidate['model'],
                    year=candidate['year'],
                    image=candidate['image'],
                )
                total_created += 1
                created += 1

        # Create example users
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'adminpass')
            self.stdout.write(self.style.SUCCESS('Created superuser admin / password: adminpass'))

        if not User.objects.filter(username='juan').exists():
            User.objects.create_user('juan', 'juan@example.com', 'secret')
            self.stdout.write(self.style.SUCCESS('Created user juan / password: secret'))

        extra_users = [
            {
                'username': 'maria',
                'email': 'maria@example.com',
                'password': 'secret',
                'first_name': 'Maria',
                'last_name': 'Lopez',
            },
            {
                'username': 'pedro',
                'email': 'pedro@example.com',
                'password': 'secret',
                'first_name': 'Pedro',
                'last_name': 'Gomez',
            },
            {
                'username': 'lucia',
                'email': 'lucia@example.com',
                'password': 'secret',
                'first_name': 'Lucia',
                'last_name': 'Martinez',
            },
            {
                'username': 'carlos',
                'email': 'carlos@example.com',
                'password': 'secret',
                'first_name': 'Carlos',
                'last_name': 'Fernandez',
            },
        ]

        for user_data in extra_users:
            if User.objects.filter(username=user_data['username']).exists():
                continue
            User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
            )

        # Create sample reviews for existing repuestos
        review_users = list(User.objects.filter(is_staff=False).order_by('id'))
        if review_users:
            review_comments = [
                'Muy buen repuesto, llego en perfectas condiciones.',
                'Buena relacion precio/calidad, lo recomiendo.',
                'Se instalo sin problemas y funciona bien.',
                'Calidad correcta por el precio.',
                'Producto conforme a la descripcion.',
            ]
            review_ratings = [5, 4, 4, 5, 3]
            repuestos_qs = Repuesto.objects.all().order_by('id')

            user_index = 0
            for repuesto in repuestos_qs:
                # Create up to 2 reviews per repuesto
                for _ in range(2):
                    user = review_users[user_index % len(review_users)]
                    user_index += 1
                    if Review.objects.filter(user=user, repuesto=repuesto).exists():
                        continue
                    comment = review_comments[user_index % len(review_comments)]
                    rating = review_ratings[user_index % len(review_ratings)]
                    Review.objects.create(
                        user=user,
                        repuesto=repuesto,
                        rating=rating,
                        comment=comment,
                    )

        # Ensure profiles for non-staff users
        profile_templates = [
            {
                'phone': '1134567890',
                'dni': '30123456',
                'address_line1': 'Av. Corrientes 1234',
                'address_line2': 'Piso 2',
                'city': 'CABA',
                'province': 'CABA',
                'postal_code': '1001',
                'country': 'Argentina',
            },
            {
                'phone': '1145678901',
                'dni': '28987654',
                'address_line1': 'Calle San Martin 456',
                'address_line2': 'Depto B',
                'city': 'La Plata',
                'province': 'Buenos Aires',
                'postal_code': '1900',
                'country': 'Argentina',
            },
            {
                'phone': '1167890123',
                'dni': '31999888',
                'address_line1': 'Av. Colon 789',
                'address_line2': 'Casa',
                'city': 'Córdoba',
                'province': 'Córdoba',
                'postal_code': '5000',
                'country': 'Argentina',
            },
            {
                'phone': '1178901234',
                'dni': '27111222',
                'address_line1': 'Bv. Oroño 321',
                'address_line2': 'Torre 1',
                'city': 'Rosario',
                'province': 'Santa Fe',
                'postal_code': '2000',
                'country': 'Argentina',
            },
        ]

        for index, user in enumerate(User.objects.filter(is_staff=False).order_by('id')):
            if hasattr(user, 'profile'):
                continue
            template = profile_templates[index % len(profile_templates)]
            UserProfile.objects.create(user=user, **template)

        # Create sample orders
        target_orders = 40
        existing_orders = Order.objects.count()
        orders_to_create = max(0, target_orders - existing_orders)
        order_users = list(User.objects.filter(is_staff=False).order_by('id'))
        repuestos_all = list(Repuesto.objects.all())
        repuestos_in_stock = [r for r in repuestos_all if r.stock > 0]
        statuses = ['pending', 'paid', 'shipped', 'delivered']

        if orders_to_create > 0 and order_users and repuestos_all:
            for order_index in range(orders_to_create):
                user = order_users[order_index % len(order_users)]
                profile = getattr(user, 'profile', None)
                order = Order.objects.create(
                    user=user,
                    status=random.choice(statuses),
                    phone=getattr(profile, 'phone', ''),
                    dni=getattr(profile, 'dni', ''),
                    address_line1=getattr(profile, 'address_line1', ''),
                    address_line2=getattr(profile, 'address_line2', ''),
                    city=getattr(profile, 'city', ''),
                    province=getattr(profile, 'province', ''),
                    postal_code=getattr(profile, 'postal_code', ''),
                    country=getattr(profile, 'country', 'Argentina') or 'Argentina',
                    coupon_code=None,
                    discount_amount=Decimal('0.00'),
                )

                order_date = timezone.now() - timedelta(days=random.randint(0, 90))
                Order.objects.filter(id=order.id).update(created_at=order_date)

                items_count = random.randint(1, 4)
                total = Decimal('0.00')
                used_repuestos = set()
                pool = repuestos_in_stock or repuestos_all

                for _ in range(items_count):
                    repuesto = random.choice(pool)
                    if repuesto.id in used_repuestos:
                        continue
                    used_repuestos.add(repuesto.id)

                    qty_max = 5
                    if repuesto.stock:
                        qty_max = max(1, min(5, repuesto.stock))
                    qty = random.randint(1, qty_max)
                    price = repuesto.price

                    OrderItem.objects.create(
                        order=order,
                        repuesto=repuesto,
                        name=repuesto.name,
                        sku=repuesto.sku,
                        price=price,
                        qty=qty,
                        brand=repuesto.brand,
                        model=repuesto.model,
                        year=repuesto.year,
                    )
                    total += price * qty

                Order.objects.filter(id=order.id).update(total=total)

        self.stdout.write(self.style.SUCCESS(f'Created {len(created_categories)} categories and {total_created} repuestos.'))
