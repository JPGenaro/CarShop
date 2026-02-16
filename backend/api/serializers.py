from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import serializers
from .models import Categoria, Repuesto, UserProfile, Order, OrderItem, Notification, Favorite, Review, Coupon, ImagenRepuesto


class ImagenRepuestoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagenRepuesto
        fields = ('id', 'image', 'orden', 'created_at')


class ProfileSerializer(serializers.ModelSerializer):
    phone = serializers.RegexField(regex=r'^\d{7,15}$')
    dni = serializers.RegexField(regex=r'^\d{7,12}$')
    address_line1 = serializers.CharField(max_length=200)
    address_line2 = serializers.CharField(max_length=200, required=False, allow_blank=True)
    city = serializers.CharField(max_length=100)
    province = serializers.CharField(max_length=100)
    postal_code = serializers.RegexField(regex=r'^\d{3,10}$')
    country = serializers.CharField(max_length=60, required=False, allow_blank=True)

    class Meta:
        model = UserProfile
        fields = (
            'phone', 'dni', 'address_line1', 'address_line2', 'city', 'province', 'postal_code', 'country'
        )

    def validate_country(self, value):
        if value and value.strip().lower() != 'argentina':
            raise serializers.ValidationError('El país debe ser Argentina.')
        return 'Argentina'

    def validate_province(self, value):
        allowed = {
            'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
            'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
            'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
            'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
            'Tierra del Fuego', 'Tucumán'
        }
        if value not in allowed:
            raise serializers.ValidationError('Provincia inválida.')
        return value

    def validate_city(self, value):
        province = self.initial_data.get('province') or ''
        map_cities = {
            'Buenos Aires': {'La Plata', 'Mar del Plata', 'Bahía Blanca', 'Tandil', 'Pergamino'},
            'CABA': {'CABA'},
            'Catamarca': {'San Fernando del Valle de Catamarca', 'Belén', 'Andalgalá'},
            'Chaco': {'Resistencia', 'Presidencia Roque Sáenz Peña', 'Villa Ángela'},
            'Chubut': {'Rawson', 'Comodoro Rivadavia', 'Trelew', 'Puerto Madryn'},
            'Córdoba': {'Córdoba', 'Villa Carlos Paz', 'Río Cuarto', 'Villa María'},
            'Corrientes': {'Corrientes', 'Goya', 'Mercedes'},
            'Entre Ríos': {'Paraná', 'Concordia', 'Gualeguaychú'},
            'Formosa': {'Formosa', 'Clorinda', 'Pirané'},
            'Jujuy': {'San Salvador de Jujuy', 'Palpalá', 'Perico'},
            'La Pampa': {'Santa Rosa', 'General Pico', 'Toay'},
            'La Rioja': {'La Rioja', 'Chilecito', 'Aimogasta'},
            'Mendoza': {'Mendoza', 'San Rafael', 'Godoy Cruz', 'Luján de Cuyo'},
            'Misiones': {'Posadas', 'Oberá', 'Eldorado'},
            'Neuquén': {'Neuquén', 'Cutral Có', 'Zapala'},
            'Río Negro': {'Viedma', 'Bariloche', 'General Roca'},
            'Salta': {'Salta', 'Orán', 'Tartagal'},
            'San Juan': {'San Juan', 'Rawson', 'Chimbas'},
            'San Luis': {'San Luis', 'Villa Mercedes', 'Merlo'},
            'Santa Cruz': {'Río Gallegos', 'Caleta Olivia', 'El Calafate'},
            'Santa Fe': {'Santa Fe', 'Rosario', 'Rafaela', 'Venado Tuerto'},
            'Santiago del Estero': {'Santiago del Estero', 'La Banda', 'Termas de Río Hondo'},
            'Tierra del Fuego': {'Ushuaia', 'Río Grande', 'Tolhuin'},
            'Tucumán': {'San Miguel de Tucumán', 'Tafí Viejo', 'Concepción'},
        }
        if province and value not in map_cities.get(province, set()):
            raise serializers.ValidationError('Ciudad inválida para la provincia seleccionada.')
        return value


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'profile')


class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=30)
    first_name = serializers.CharField(max_length=60, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=60, required=False, allow_blank=True)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8, max_length=128)
    phone = serializers.RegexField(regex=r'^\d{7,15}$', write_only=True)
    dni = serializers.RegexField(regex=r'^\d{7,12}$', write_only=True)
    address_line1 = serializers.CharField(write_only=True, max_length=200)
    address_line2 = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=200)
    city = serializers.CharField(write_only=True, max_length=100)
    province = serializers.CharField(write_only=True, max_length=100)
    postal_code = serializers.RegexField(regex=r'^\d{3,10}$', write_only=True)
    country = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=60)

    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'first_name', 'last_name',
            'phone', 'dni', 'address_line1', 'address_line2', 'city', 'province', 'postal_code', 'country'
        )

    def create(self, validated_data):
        profile_data = {
            'phone': validated_data.pop('phone', ''),
            'dni': validated_data.pop('dni', ''),
            'address_line1': validated_data.pop('address_line1', ''),
            'address_line2': validated_data.pop('address_line2', ''),
            'city': validated_data.pop('city', ''),
            'province': validated_data.pop('province', ''),
            'postal_code': validated_data.pop('postal_code', ''),
            'country': 'Argentina',
        }
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        UserProfile.objects.create(user=user, **profile_data)
        return user

    def validate_province(self, value):
        allowed = {
            'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
            'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
            'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
            'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
            'Tierra del Fuego', 'Tucumán'
        }
        if value not in allowed:
            raise serializers.ValidationError('Provincia inválida.')
        return value

    def validate_city(self, value):
        province = self.initial_data.get('province') or ''
        map_cities = {
            'Buenos Aires': {'La Plata', 'Mar del Plata', 'Bahía Blanca', 'Tandil', 'Pergamino'},
            'CABA': {'CABA'},
            'Catamarca': {'San Fernando del Valle de Catamarca', 'Belén', 'Andalgalá'},
            'Chaco': {'Resistencia', 'Presidencia Roque Sáenz Peña', 'Villa Ángela'},
            'Chubut': {'Rawson', 'Comodoro Rivadavia', 'Trelew', 'Puerto Madryn'},
            'Córdoba': {'Córdoba', 'Villa Carlos Paz', 'Río Cuarto', 'Villa María'},
            'Corrientes': {'Corrientes', 'Goya', 'Mercedes'},
            'Entre Ríos': {'Paraná', 'Concordia', 'Gualeguaychú'},
            'Formosa': {'Formosa', 'Clorinda', 'Pirané'},
            'Jujuy': {'San Salvador de Jujuy', 'Palpalá', 'Perico'},
            'La Pampa': {'Santa Rosa', 'General Pico', 'Toay'},
            'La Rioja': {'La Rioja', 'Chilecito', 'Aimogasta'},
            'Mendoza': {'Mendoza', 'San Rafael', 'Godoy Cruz', 'Luján de Cuyo'},
            'Misiones': {'Posadas', 'Oberá', 'Eldorado'},
            'Neuquén': {'Neuquén', 'Cutral Có', 'Zapala'},
            'Río Negro': {'Viedma', 'Bariloche', 'General Roca'},
            'Salta': {'Salta', 'Orán', 'Tartagal'},
            'San Juan': {'San Juan', 'Rawson', 'Chimbas'},
            'San Luis': {'San Luis', 'Villa Mercedes', 'Merlo'},
            'Santa Cruz': {'Río Gallegos', 'Caleta Olivia', 'El Calafate'},
            'Santa Fe': {'Santa Fe', 'Rosario', 'Rafaela', 'Venado Tuerto'},
            'Santiago del Estero': {'Santiago del Estero', 'La Banda', 'Termas de Río Hondo'},
            'Tierra del Fuego': {'Ushuaia', 'Río Grande', 'Tolhuin'},
            'Tucumán': {'San Miguel de Tucumán', 'Tafí Viejo', 'Concepción'},
        }
        if province and value not in map_cities.get(province, set()):
            raise serializers.ValidationError('Ciudad inválida para la provincia seleccionada.')
        return value


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ('id', 'name', 'slug', 'description')


class RepuestoSerializer(serializers.ModelSerializer):
    category = CategoriaSerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        source='category', queryset=Categoria.objects.all(), write_only=True
    )
    image = serializers.ImageField(required=False, allow_null=True)
    imagenes = ImagenRepuestoSerializer(many=True, read_only=True)

    class Meta:
        model = Repuesto
        fields = (
            'id', 'name', 'brand', 'model', 'year', 'sku', 'description', 'price', 'stock', 'image', 'imagenes', 'category', 'category_id', 'created_at', 'updated_at'
        )
        read_only_fields = ('created_at', 'updated_at')


class OrderItemSerializer(serializers.ModelSerializer):
    repuesto_id = serializers.PrimaryKeyRelatedField(source='repuesto', queryset=Repuesto.objects.all(), write_only=True, required=False)

    class Meta:
        model = OrderItem
        fields = ('id', 'repuesto_id', 'name', 'sku', 'price', 'qty', 'brand', 'model', 'year')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    coupon_code = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    user = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            'id', 'user', 'status', 'total', 'created_at',
            'phone', 'dni', 'address_line1', 'address_line2', 'city', 'province', 'postal_code', 'country',
            'coupon_code', 'discount_amount',
            'items'
        )
        read_only_fields = ('id', 'total', 'created_at', 'phone', 'dni', 'address_line1', 'address_line2', 'city', 'province', 'postal_code', 'country')

    def get_user(self, obj):
        return {'id': obj.user.id, 'username': obj.user.username} if obj.user else None

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        user = self.context['request'].user
        profile = getattr(user, 'profile', None)

        # Validate stock before creating order
        for item in items_data:
            repuesto = item.get('repuesto')
            qty = item.get('qty') or 1
            if repuesto and repuesto.stock < qty:
                raise serializers.ValidationError(
                    f'Stock insuficiente para {repuesto.name}. No hay suficiente stock disponible.'
                )

        subtotal = 0
        for item in items_data:
            repuesto = item.get('repuesto')
            price = item.get('price') or (repuesto.price if repuesto else 0)
            qty = item.get('qty') or 1
            subtotal += float(price) * qty

        coupon = None
        coupon_code = (validated_data.get('coupon_code') or '').strip().upper()
        discount_amount = 0
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code, active=True)
            except Coupon.DoesNotExist:
                raise serializers.ValidationError('Cupón inválido o inactivo')

            now = timezone.now()
            if now < coupon.valid_from or now > coupon.valid_to:
                if now > coupon.valid_to and coupon.active:
                    coupon.active = False
                    coupon.save(update_fields=['active'])
                raise serializers.ValidationError('Cupón expirado o no válido aún')

            if coupon.usage_limit and coupon.times_used >= coupon.usage_limit:
                raise serializers.ValidationError('Cupón agotado')

            if coupon.discount_type == 'percent':
                discount_amount = (subtotal * float(coupon.discount_value)) / 100
            else:
                discount_amount = float(coupon.discount_value)

            discount_amount = min(discount_amount, subtotal)

        order = Order.objects.create(
            user=user,
            status='paid',
            phone=getattr(profile, 'phone', ''),
            dni=getattr(profile, 'dni', ''),
            address_line1=getattr(profile, 'address_line1', ''),
            address_line2=getattr(profile, 'address_line2', ''),
            city=getattr(profile, 'city', ''),
            province=getattr(profile, 'province', ''),
            postal_code=getattr(profile, 'postal_code', ''),
            country=getattr(profile, 'country', 'Argentina') or 'Argentina',
            coupon_code=coupon_code or None,
            discount_amount=discount_amount,
        )

        total = 0
        for item in items_data:
            repuesto = item.get('repuesto')
            price = item.get('price') or (repuesto.price if repuesto else 0)
            qty = item.get('qty') or 1
            total += float(price) * qty
            
            # Create order item
            OrderItem.objects.create(
                order=order,
                repuesto=repuesto,
                name=item.get('name') or (repuesto.name if repuesto else ''),
                sku=item.get('sku') or (repuesto.sku if repuesto else None),
                price=price,
                qty=qty,
                brand=item.get('brand') or (repuesto.brand if repuesto else ''),
                model=item.get('model') or (repuesto.model if repuesto else ''),
                year=item.get('year') or (repuesto.year if repuesto else None),
            )
            
            # Reduce stock
            if repuesto:
                repuesto.stock -= qty
                repuesto.save()

        # Apply discount to total
        discount = float(order.discount_amount or 0)
        order.total = max(0, total - discount)
        order.save()

        if coupon:
            coupon.times_used = (coupon.times_used or 0) + 1
            coupon.save()
        return order


class NotificationSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True)

    class Meta:
        model = Notification
        fields = ('id', 'order_id', 'message', 'is_read', 'created_at')


class FavoriteSerializer(serializers.ModelSerializer):
    repuesto_detail = serializers.SerializerMethodField()

    class Meta:
        model = Favorite
        fields = ('id', 'repuesto', 'repuesto_detail', 'created_at')
        read_only_fields = ('id', 'created_at', 'repuesto_detail')

    def get_repuesto_detail(self, obj):
        return RepuestoSerializer(obj.repuesto).data


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'user', 'username', 'repuesto', 'rating', 'comment', 'created_at')
        read_only_fields = ('id', 'user', 'username', 'created_at')

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('El rating debe estar entre 1 y 5.')
        return value


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ('id', 'code', 'discount_type', 'discount_value', 'active', 'valid_from', 'valid_to', 'usage_limit', 'times_used')
        read_only_fields = ('id', 'times_used')
