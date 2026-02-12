from django.db import models
from django.utils.text import slugify
from django.contrib.auth.models import User
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver


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
	brand = models.CharField(max_length=100, blank=True)
	model = models.CharField(max_length=100, blank=True)
	year = models.PositiveIntegerField(blank=True, null=True)
	sku = models.CharField(max_length=50, blank=True, unique=True, null=True)
	description = models.TextField(blank=True)
	price = models.DecimalField(max_digits=10, decimal_places=2)
	stock = models.PositiveIntegerField(default=0)
	image = models.ImageField(upload_to='repuestos/', blank=True, null=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.name


class UserProfile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
	phone = models.CharField(max_length=30, blank=True)
	dni = models.CharField(max_length=20, blank=True)
	address_line1 = models.CharField(max_length=200, blank=True)
	address_line2 = models.CharField(max_length=200, blank=True)
	city = models.CharField(max_length=100, blank=True)
	province = models.CharField(max_length=100, blank=True)
	postal_code = models.CharField(max_length=20, blank=True)
	country = models.CharField(max_length=60, default='Argentina')

	def __str__(self):
		return f"Perfil {self.user.username}"


class Order(models.Model):
	STATUS_CHOICES = (
		('pending', 'Pendiente'),
		('paid', 'Pagado'),
		('shipped', 'Enviado'),
		('delivered', 'Entregado'),
	)
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='paid')
	total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
	created_at = models.DateTimeField(auto_now_add=True)

	# snapshot of shipping data
	phone = models.CharField(max_length=30, blank=True)
	dni = models.CharField(max_length=20, blank=True)
	address_line1 = models.CharField(max_length=200, blank=True)
	address_line2 = models.CharField(max_length=200, blank=True)
	city = models.CharField(max_length=100, blank=True)
	province = models.CharField(max_length=100, blank=True)
	postal_code = models.CharField(max_length=20, blank=True)
	country = models.CharField(max_length=60, default='Argentina')

	def __str__(self):
		return f"Orden #{self.id} - {self.user.username}"


class OrderItem(models.Model):
	order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
	repuesto = models.ForeignKey(Repuesto, on_delete=models.SET_NULL, null=True, blank=True)
	name = models.CharField(max_length=200)
	sku = models.CharField(max_length=50, blank=True, null=True)
	price = models.DecimalField(max_digits=10, decimal_places=2)
	qty = models.PositiveIntegerField(default=1)
	brand = models.CharField(max_length=100, blank=True)
	model = models.CharField(max_length=100, blank=True)
	year = models.PositiveIntegerField(blank=True, null=True)

	def __str__(self):
		return f"{self.name} x{self.qty}"


class Notification(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
	order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='notifications')
	message = models.CharField(max_length=255)
	is_read = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.user.username} - {self.message}"


@receiver(pre_save, sender=Order)
def store_previous_status(sender, instance, **kwargs):
	if not instance.pk:
		instance._old_status = None
		return
	try:
		old = Order.objects.get(pk=instance.pk)
		instance._old_status = old.status
	except Order.DoesNotExist:
		instance._old_status = None


@receiver(post_save, sender=Order)
def create_status_notification(sender, instance, created, **kwargs):
	if created:
		return
	old_status = getattr(instance, '_old_status', None)
	if old_status and old_status != instance.status:
		Notification.objects.create(
			user=instance.user,
			order=instance,
			message=f"Tu pedido #{instance.id} cambió a estado {instance.get_status_display()}.",
		)

