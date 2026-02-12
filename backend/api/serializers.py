from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Categoria, Repuesto


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
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
            'id', 'name', 'sku', 'description', 'price', 'stock', 'image', 'category', 'category_id', 'created_at', 'updated_at'
        )
        read_only_fields = ('created_at', 'updated_at')
