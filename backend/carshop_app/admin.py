from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Address, Document, PaymentMethod, Category, Product, User, Order, OrderProduct

admin.site.register(Address)
admin.site.register(Document)
admin.site.register(PaymentMethod)
admin.site.register(Category)
admin.site.register(OrderProduct)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'stock', 'category')
    search_fields = ('name',)
    list_filter = ('category',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'force_date', 'payment_method')
    list_filter = ('force_date', 'payment_method')

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Especifica los campos a mostrar en la lista
    list_display = ('email', 'name', 'surname', 'is_staff')
    
    # Campos para la edición de usuarios
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Información personal', {'fields': ('name', 'surname', 'birth_date', 'phone_number')}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas importantes', {'fields': ('last_login', 'date_joined')}),
    )
    
    # Campos para la creación de usuarios
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'surname', 'password1', 'password2'),
        }),
    )
    
    # Ordenar por email en lugar de username
    ordering = ('email',)  # <-- Esto soluciona el error
    
    search_fields = ('email', 'name', 'surname')
    filter_horizontal = ('groups', 'user_permissions',)