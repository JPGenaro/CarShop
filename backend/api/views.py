from rest_framework import generics, permissions, viewsets, parsers, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
import re
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Sum, Count, Q, F
from datetime import timedelta
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    CategoriaSerializer,
    RepuestoSerializer,
    ProfileSerializer,
    OrderSerializer,
    NotificationSerializer,
    FavoriteSerializer,
    ReviewSerializer,
    CouponSerializer,
    ImagenRepuestoSerializer,
)
from .models import Categoria, Repuesto, UserProfile, Order, OrderItem, Notification, Favorite, Review, Coupon, ImagenRepuesto


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

    def get_permissions(self):
        if self.action in {'create', 'update', 'partial_update', 'destroy'}:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticatedOrReadOnly()]


class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('repuesto')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['delete'])
    def remove(self, request):
        repuesto_id = request.data.get('repuesto')
        if not repuesto_id:
            return Response({'error': 'repuesto requerido'}, status=status.HTTP_400_BAD_REQUEST)
        deleted, _ = Favorite.objects.filter(user=request.user, repuesto_id=repuesto_id).delete()
        return Response({'deleted': deleted}, status=status.HTTP_200_OK)


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        repuesto_id = self.request.query_params.get('repuesto')
        if repuesto_id:
            return Review.objects.filter(repuesto_id=repuesto_id).select_related('user')
        return Review.objects.select_related('user', 'repuesto')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_permissions(self):
        if self.action in {'create', 'update', 'partial_update', 'destroy'}:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]


class ValidateCouponView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        if not code:
            return Response({'error': 'Código requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            coupon = Coupon.objects.get(code=code, active=True)
        except Coupon.DoesNotExist:
            return Response({'error': 'Cupón inválido o inactivo'}, status=status.HTTP_404_NOT_FOUND)
        
        now = timezone.now()
        if now < coupon.valid_from or now > coupon.valid_to:
            return Response({'error': 'Cupón expirado o no válido aún'}, status=status.HTTP_400_BAD_REQUEST)
        
        if coupon.usage_limit and coupon.times_used >= coupon.usage_limit:
            return Response({'error': 'Cupón agotado'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(CouponSerializer(coupon).data, status=status.HTTP_200_OK)


class ImagenRepuestoViewSet(viewsets.ModelViewSet):
    serializer_class = ImagenRepuestoSerializer
    permission_classes = (permissions.IsAdminUser,)
    queryset = ImagenRepuesto.objects.all()

    def perform_create(self, serializer):
        serializer.save()


class DashboardStatsView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        # Total revenue
        total_revenue = Order.objects.aggregate(total=Sum('total'))['total'] or 0

        # Orders by status
        orders_by_status = Order.objects.values('status').annotate(count=Count('id'))

        # Sales by day (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        sales_by_day = []
        for i in range(30):
            date = thirty_days_ago + timedelta(days=i)
            date_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
            date_end = date_start + timedelta(days=1)
            daily_sales = Order.objects.filter(
                created_at__gte=date_start,
                created_at__lt=date_end
            ).aggregate(total=Sum('total'))['total'] or 0
            sales_by_day.append({
                'date': date.strftime('%Y-%m-%d'),
                'sales': float(daily_sales)
            })

        # Top selling products
        top_products = OrderItem.objects.values('name', 'sku').annotate(
            total_sold=Sum('qty'),
            revenue=Sum(F('price') * F('qty'))
        ).order_by('-total_sold')[:10]

        # Low stock products
        low_stock = Repuesto.objects.filter(stock__lte=5).values(
            'id', 'name', 'sku', 'stock', 'price'
        ).order_by('stock')[:10]

        # Recent orders with full details
        recent_orders = Order.objects.select_related('user').prefetch_related('items').all().order_by('-created_at')[:5]
        recent_orders_data = OrderSerializer(recent_orders, many=True).data

        # Summary stats
        total_products = Repuesto.objects.count()
        total_orders = Order.objects.count()
        total_customers = User.objects.filter(is_staff=False).count()

        return Response({
            'revenue': {
                'total': float(total_revenue),
                'orders_count': total_orders,
            },
            'orders_by_status': list(orders_by_status),
            'sales_by_day': sales_by_day,
            'top_products': list(top_products),
            'low_stock': list(low_stock),
            'recent_orders': recent_orders_data,
            'summary': {
                'total_products': total_products,
                'total_orders': total_orders,
                'total_customers': total_customers,
                'low_stock_count': Repuesto.objects.filter(stock__lte=5).count(),
            }
        })

