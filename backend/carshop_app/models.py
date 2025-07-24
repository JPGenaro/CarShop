from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _

class Address(models.Model):
    province = models.CharField(max_length=50)
    location = models.CharField(max_length=50)
    district = models.CharField(max_length=50)
    height = models.CharField(max_length=10)
    postal_code = models.CharField(max_length=50)

    class Meta:
        verbose_name_plural = "Addresses"

    def __str__(self):
        return f"{self.height}, {self.district}, {self.location}, {self.province}"

class Document(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    number_document = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.name} - {self.number_document}"

class PaymentMethod(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.IntegerField(validators=[MinValueValidator(0)])
    stock = models.IntegerField(validators=[MinValueValidator(0)])
    category = models.ForeignKey(Category, on_delete=models.PROTECT)

    def __str__(self):
        return f"{self.name} (${self.price})"

from django.contrib.auth.models import AbstractUser

class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, name_user, name, surname, password, **extra_fields):
        if not email:
            raise ValueError('El email debe ser proporcionado')
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            name_user=name_user,
            name=name,
            surname=surname,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, name_user, name, surname, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, name_user, name, surname, password, **extra_fields)

    def create_superuser(self, email, name_user, name, surname, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('birth_date', '2000-01-01')  # Valor por defecto
        extra_fields.setdefault('phone_number', '000000000')  # Valor por defecto

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser debe tener is_superuser=True.')

        return self._create_user(email, name_user, name, surname, password, **extra_fields)

class User(AbstractUser):
    username = None
    first_name = None
    last_name = None
    
    email = models.EmailField(_('email address'), unique=True)
    name_user = models.CharField('nombre de usuario', max_length=20, unique=True)
    name = models.CharField('nombre', max_length=20)
    surname = models.CharField('apellido', max_length=20)
    birth_date = models.DateField('fecha de nacimiento', null=True, blank=True)
    phone_number = models.CharField('teléfono', max_length=20, null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name_user', 'name', 'surname']

    iis_active = models.BooleanField(
        _('active'),
        default=True,
        help_text=_('Designates whether this user should be treated as active. '
                   'Unselect this instead of deleting accounts.')
    )
    is_staff = models.BooleanField(
        _('staff status'),
        default=False,
        help_text=_('Designates whether the user can log into this admin site.')
    )
    date_joined = models.DateTimeField(
        _('date joined'),
        default=timezone.now
    )
    
    objects = UserManager()

    def __str__(self):
        return f"{self.name} {self.surname}"

    class Meta:
        verbose_name = 'usuario'
        verbose_name_plural = 'usuarios'

class Order(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    force_date = models.DateField()
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.PROTECT)
    products = models.ManyToManyField(Product, through='OrderProduct')

    def __str__(self):
        return f"Order #{self.id} - {self.name}"

class OrderProduct(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    final_price = models.DecimalField(max_digits=10, decimal_places=2)
    final_quantity = models.IntegerField(validators=[MinValueValidator(1)])

    def __str__(self):
        return f"{self.product.name} x{self.final_quantity} in Order #{self.order.id}"

    class Meta:
        unique_together = ('order', 'product')