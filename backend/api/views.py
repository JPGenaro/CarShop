from rest_framework import generics, permissions, viewsets, parsers
from django.contrib.auth.models import User
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    CategoriaSerializer,
    RepuestoSerializer,
)
from .models import Categoria, Repuesto


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    filterset_fields = ('name', 'slug')
    search_fields = ('name', 'description')
    ordering_fields = ('name',)


class RepuestoViewSet(viewsets.ModelViewSet):
    queryset = Repuesto.objects.select_related('category').all()
    serializer_class = RepuestoSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    parser_classes = (parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser)
    filterset_fields = {
        'price': ['exact', 'lt', 'gt', 'lte', 'gte'],
        'stock': ['exact', 'lt', 'gt', 'lte', 'gte'],
        'category': ['exact'],
        'sku': ['exact'],
        'brand': ['exact'],
        'model': ['exact'],
        'year': ['exact', 'lt', 'gt', 'lte', 'gte'],
    }
    search_fields = ('name', 'description', 'sku', 'brand', 'model')
    ordering_fields = ('price', 'created_at', 'name', 'year')
