from rest_framework import generics, permissions, viewsets, parsers
from django.contrib.auth.models import User
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    CategoriaSerializer,
    RepuestoSerializer,
    ProfileSerializer,
    OrderSerializer,
    NotificationSerializer,
)
from .models import Categoria, Repuesto, UserProfile, Order, Notification


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save()


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')


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
