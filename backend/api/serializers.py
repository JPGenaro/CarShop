from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Categoria, Repuesto, UserProfile, Order, OrderItem, Notification


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

    class Meta:
        model = Repuesto
        fields = (
            'id', 'name', 'brand', 'model', 'year', 'sku', 'description', 'price', 'stock', 'image', 'category', 'category_id', 'created_at', 'updated_at'
        )
        read_only_fields = ('created_at', 'updated_at')


class OrderItemSerializer(serializers.ModelSerializer):
    repuesto_id = serializers.PrimaryKeyRelatedField(source='repuesto', queryset=Repuesto.objects.all(), write_only=True, required=False)

    class Meta:
        model = OrderItem
        fields = ('id', 'repuesto_id', 'name', 'sku', 'price', 'qty', 'brand', 'model', 'year')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = (
            'id', 'status', 'total', 'created_at',
            'phone', 'dni', 'address_line1', 'address_line2', 'city', 'province', 'postal_code', 'country',
            'items'
        )

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        user = self.context['request'].user
        profile = getattr(user, 'profile', None)

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
        )

        total = 0
        for item in items_data:
            repuesto = item.get('repuesto')
            price = item.get('price') or (repuesto.price if repuesto else 0)
            qty = item.get('qty') or 1
            total += float(price) * qty
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

        order.total = total
        order.save()
        return order


class NotificationSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True)

    class Meta:
        model = Notification
        fields = ('id', 'order_id', 'message', 'is_read', 'created_at')
