from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, MeView, ProfileView, CategoriaViewSet, RepuestoViewSet, OrderViewSet, NotificationViewSet, AdminAssistantView, FavoriteViewSet, ReviewViewSet, ValidateCouponView, ImagenRepuestoViewSet, DashboardStatsView

router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet, basename='categoria')
router.register(r'repuestos', RepuestoViewSet, basename='repuesto')
router.register(r'orders', OrderViewSet, basename='orders')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'favorites', FavoriteViewSet, basename='favorites')
router.register(r'reviews', ReviewViewSet, basename='reviews')
router.register(r'imagenes', ImagenRepuestoViewSet, basename='imagenes')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/me/', MeView.as_view(), name='auth_me'),
    path('auth/profile/', ProfileView.as_view(), name='auth_profile'),
    path('admin/assistant/', AdminAssistantView.as_view(), name='admin_assistant'),
    path('admin/dashboard/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('coupons/validate/', ValidateCouponView.as_view(), name='validate_coupon'),
]
