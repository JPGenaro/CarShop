from rest_framework import generics, permissions, viewsets, parsers, status
from rest_framework.views import APIView
from rest_framework.response import Response
import re
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


class AdminAssistantView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

        message = (request.data.get('message') or '').strip().lower()
        if not message:
            return Response({'detail': 'Mensaje vacío.'}, status=status.HTTP_400_BAD_REQUEST)

        if message in {'ayuda', 'help', '?', 'comandos'}:
            return Response({
                'ok': True,
                'message': (
                    'Comandos: "subir stock sku ABC a 50", "bajar stock sku ABC a 10", "set stock id 12 a 30", '
                    '"ver stock sku ABC", "sumar stock a todos +5", "restar stock a todos -2", '
                    '"poner stock a todos 10", "ver total productos", "ver stock bajo".'
                )
            })

        message = message.replace('aumentar', 'subir').replace('incrementar', 'subir').replace('sumar', 'subir')
        message = message.replace('disminuir', 'bajar').replace('reducir', 'bajar').replace('restar', 'bajar')
        message = message.replace('colocar', 'set').replace('poner', 'set').replace('fijar', 'set')

        match = re.search(r'(subir|bajar)\s+stock\s+sku\s+(\S+)\s+a\s+(\d+)', message)
        if match:
            action, sku, qty = match.groups()
            qty = int(qty)
            repuesto = Repuesto.objects.filter(sku__iexact=sku).first()
            if not repuesto:
                return Response({'ok': False, 'message': f'SKU {sku} no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
            if action == 'subir':
                repuesto.stock += qty
            else:
                repuesto.stock = max(0, repuesto.stock - qty)
            repuesto.save()
            return Response({'ok': True, 'message': f'Stock actualizado. {repuesto.sku}: {repuesto.stock}.'})

        match = re.search(r'set\s+stock\s+id\s+(\d+)\s+a\s+(\d+)', message)
        if match:
            repuesto_id, qty = match.groups()
            repuesto = Repuesto.objects.filter(id=int(repuesto_id)).first()
            if not repuesto:
                return Response({'ok': False, 'message': f'ID {repuesto_id} no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
            repuesto.stock = int(qty)
            repuesto.save()
            return Response({'ok': True, 'message': f'Stock actualizado. {repuesto.sku}: {repuesto.stock}.'})

        match = re.search(r'ver\s+stock\s+sku\s+(\S+)', message)
        if match:
            sku = match.group(1)
            repuesto = Repuesto.objects.filter(sku__iexact=sku).first()
            if not repuesto:
                return Response({'ok': False, 'message': f'SKU {sku} no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
            return Response({'ok': True, 'message': f'{repuesto.sku}: stock {repuesto.stock}.'})

        match = re.search(r'subir\s+stock\s+a\s+todos\s*\+?(\d+)', message)
        if match:
            qty = int(match.group(1))
            updated = Repuesto.objects.update(stock=models.F('stock') + qty)
            return Response({'ok': True, 'message': f'Se sumó stock +{qty} a {updated} productos.'})

        match = re.search(r'bajar\s+stock\s+a\s+todos\s*-?(\d+)', message)
        if match:
            qty = int(match.group(1))
            updated = 0
            for repuesto in Repuesto.objects.all():
                repuesto.stock = max(0, repuesto.stock - qty)
                repuesto.save(update_fields=['stock'])
                updated += 1
            return Response({'ok': True, 'message': f'Se restó stock -{qty} a {updated} productos.'})

        match = re.search(r'set\s+stock\s+a\s+todos\s+(\d+)', message)
        if match:
            qty = int(match.group(1))
            updated = Repuesto.objects.update(stock=qty)
            return Response({'ok': True, 'message': f'Se fijó stock {qty} en {updated} productos.'})

        if 'ver total productos' in message or 'total productos' in message:
            total = Repuesto.objects.count()
            return Response({'ok': True, 'message': f'Total de productos: {total}.'})

        if 'ver stock bajo' in message or 'stock bajo' in message:
            low = Repuesto.objects.filter(stock__lte=5).count()
            return Response({'ok': True, 'message': f'Productos con stock bajo (<=5): {low}.'})

        return Response({
            'ok': False,
            'message': 'No entendí el comando. Escribí "ayuda" para ver ejemplos.'
        }, status=status.HTTP_400_BAD_REQUEST)


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
