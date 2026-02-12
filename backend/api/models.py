from django.db import models
from django.utils.text import slugify


class Categoria(models.Model):
	name = models.CharField(max_length=100, unique=True)
	slug = models.SlugField(max_length=120, unique=True, blank=True)
	description = models.TextField(blank=True)

	def save(self, *args, **kwargs):
		if not self.slug:
			self.slug = slugify(self.name)
		super().save(*args, **kwargs)

	def __str__(self):
		return self.name


class Repuesto(models.Model):
	category = models.ForeignKey(Categoria, related_name='repuestos', on_delete=models.CASCADE)
	name = models.CharField(max_length=200)
	sku = models.CharField(max_length=50, blank=True, unique=True, null=True)
	description = models.TextField(blank=True)
	price = models.DecimalField(max_digits=10, decimal_places=2)
	stock = models.PositiveIntegerField(default=0)
	image = models.ImageField(upload_to='repuestos/', blank=True, null=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.name

