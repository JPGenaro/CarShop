from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, MeView, ProfileView, CategoriaViewSet, RepuestoViewSet, OrderViewSet, NotificationViewSet

router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet, basename='categoria')
router.register(r'repuestos', RepuestoViewSet, basename='repuesto')
router.register(r'orders', OrderViewSet, basename='orders')
router.register(r'notifications', NotificationViewSet, basename='notifications')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/me/', MeView.as_view(), name='auth_me'),
    path('auth/profile/', ProfileView.as_view(), name='auth_profile'),
]
