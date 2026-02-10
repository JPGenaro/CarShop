from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, MeView, CategoriaViewSet, RepuestoViewSet

router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet, basename='categoria')
router.register(r'repuestos', RepuestoViewSet, basename='repuesto')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/me/', MeView.as_view(), name='auth_me'),
]
