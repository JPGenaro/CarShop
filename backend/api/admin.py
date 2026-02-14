from django.contrib import admin
from .models import Categoria, Repuesto, Order, OrderItem, Notification, Favorite, Review, Coupon, ImagenRepuesto


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
	list_display = ('id', 'name', 'slug')
	search_fields = ('name',)


class ImagenRepuestoInline(admin.TabularInline):
	model = ImagenRepuesto
	extra = 1
	fields = ('image', 'orden')


@admin.register(Repuesto)
class RepuestoAdmin(admin.ModelAdmin):
	list_display = ('id', 'name', 'sku', 'category', 'price', 'stock')
	list_filter = ('category',)
	search_fields = ('name', 'sku')
	inlines = [ImagenRepuestoInline]


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


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
	list_display = ('id', 'user', 'repuesto', 'created_at')
	search_fields = ('user__username', 'repuesto__name')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
	list_display = ('id', 'user', 'repuesto', 'rating', 'created_at')
	list_filter = ('rating',)
	search_fields = ('user__username', 'repuesto__name', 'comment')


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
	list_display = ('id', 'code', 'discount_type', 'discount_value', 'active', 'valid_from', 'valid_to', 'times_used')
	list_filter = ('active', 'discount_type')
	search_fields = ('code',)
