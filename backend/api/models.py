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


class ImagenRepuesto(models.Model):
	repuesto = models.ForeignKey(Repuesto, related_name='imagenes', on_delete=models.CASCADE)
	image = models.ImageField(upload_to='repuestos/')
	orden = models.PositiveIntegerField(default=0)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['orden', 'id']

	def __str__(self):
		return f"Imagen {self.orden} - {self.repuesto.name}"


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

	# coupon/discount info
	coupon_code = models.CharField(max_length=50, blank=True, null=True)
	discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

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
	NOTIFICATION_TYPES = (
		('order_status', 'Cambio de estado de orden'),
		('stock_low', 'Stock bajo'),
		('stock_high', 'Stock alto'),
	)
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
	order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
	repuesto = models.ForeignKey(Repuesto, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
	notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='order_status')
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
			notification_type='order_status',
			message=f"Tu pedido #{instance.id} cambió a estado {instance.get_status_display()}.",
		)


@receiver(pre_save, sender=Repuesto)
def store_previous_stock(sender, instance, **kwargs):
	if not instance.pk:
		instance._old_stock = None
		return
	try:
		old = Repuesto.objects.get(pk=instance.pk)
		instance._old_stock = old.stock
	except Repuesto.DoesNotExist:
		instance._old_stock = None


@receiver(post_save, sender=Repuesto)
def create_stock_notification(sender, instance, created, **kwargs):
	if created:
		return
	old_stock = getattr(instance, '_old_stock', None)
	if old_stock is None or old_stock == instance.stock:
		return
	
	# Notificar a admins si el stock es bajo (<= 5)
	if instance.stock <= 5 and old_stock > 5:
		for admin in User.objects.filter(is_staff=True):
			Notification.objects.create(
				user=admin,
				repuesto=instance,
				notification_type='stock_low',
				message=f"¡Stock bajo! {instance.name} tiene solo {instance.stock} unidades.",
			)
	# Notificar cuando el stock vuelve a niveles normales (> 20)
	elif instance.stock > 20 and old_stock <= 20:
		for admin in User.objects.filter(is_staff=True):
			Notification.objects.create(
				user=admin,
				repuesto=instance,
				notification_type='stock_high',
				message=f"Stock recuperado: {instance.name} ahora tiene {instance.stock} unidades.",
			)


class Favorite(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
	repuesto = models.ForeignKey(Repuesto, on_delete=models.CASCADE, related_name='favorited_by')
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = ('user', 'repuesto')

	def __str__(self):
		return f"{self.user.username} - {self.repuesto.name}"


class Review(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
	repuesto = models.ForeignKey(Repuesto, on_delete=models.CASCADE, related_name='reviews')
	rating = models.PositiveIntegerField(default=5)  # 1-5
	comment = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = ('user', 'repuesto')

	def __str__(self):
		return f"{self.user.username} - {self.repuesto.name} ({self.rating}⭐)"


class Coupon(models.Model):
	code = models.CharField(max_length=50, unique=True)
	discount_type = models.CharField(max_length=10, choices=[('percent', 'Porcentaje'), ('fixed', 'Fijo')], default='percent')
	discount_value = models.DecimalField(max_digits=10, decimal_places=2)
	active = models.BooleanField(default=True)
	valid_from = models.DateTimeField()
	valid_to = models.DateTimeField()
	usage_limit = models.PositiveIntegerField(null=True, blank=True)
	times_used = models.PositiveIntegerField(default=0)

	def __str__(self):
		return f"{self.code} (-{self.discount_value}{'%' if self.discount_type == 'percent' else '$'})"

