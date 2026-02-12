from django.contrib import admin
from .models import Categoria, Repuesto, Order, OrderItem, Notification


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
	list_display = ('id', 'name', 'slug')
	search_fields = ('name',)


@admin.register(Repuesto)
class RepuestoAdmin(admin.ModelAdmin):
	list_display = ('id', 'name', 'sku', 'category', 'price', 'stock')
	list_filter = ('category',)
	search_fields = ('name', 'sku')


class OrderItemInline(admin.TabularInline):
	model = OrderItem
	extra = 0
	readonly_fields = ('name', 'sku', 'price', 'qty', 'brand', 'model', 'year')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
	list_display = ('id', 'user', 'status', 'total', 'created_at')
	list_filter = ('status', 'created_at')
	search_fields = ('id', 'user__username')
	inlines = [OrderItemInline]
	readonly_fields = ('created_at',)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
	list_display = ('id', 'user', 'order', 'is_read', 'created_at')
	list_filter = ('is_read',)
	search_fields = ('user__username', 'order__id', 'message')
