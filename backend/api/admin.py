from django.contrib import admin
from .models import Categoria, Repuesto


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
	list_display = ('id', 'name', 'slug')
	search_fields = ('name',)


@admin.register(Repuesto)
class RepuestoAdmin(admin.ModelAdmin):
	list_display = ('id', 'name', 'sku', 'category', 'price', 'stock')
	list_filter = ('category',)
	search_fields = ('name', 'sku')
