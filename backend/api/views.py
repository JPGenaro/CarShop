from rest_framework import generics, permissions, viewsets, parsers, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
import re
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Sum, Count, Q, F, CharField
from django.db.models.functions import Cast
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
        # Admins can see all orders, users only see their own
        if self.request.user.is_staff:
            return Order.objects.all().order_by('-created_at')
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save()

    def update(self, request, *args, **kwargs):
        # Only admins can update orders
        if not request.user.is_staff:
            return Response({'detail': 'No tienes permiso para actualizar órdenes.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        # Only admins can update orders
        if not request.user.is_staff:
            return Response({'detail': 'No tienes permiso para actualizar órdenes.'}, status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)


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

    def get_permissions(self):
        if self.action in {'create', 'update', 'partial_update', 'destroy'}:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticatedOrReadOnly()]


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
        'brand': ['icontains'],
        'model': ['icontains'],
    }
    search_fields = ('name', 'description', 'sku', 'brand', 'model')
    ordering_fields = ('price', 'created_at', 'name', 'year')

    def get_queryset(self):
        qs = super().get_queryset()
        brand = self.request.query_params.get('brand', '').strip()
        model = self.request.query_params.get('model', '').strip()
        year = self.request.query_params.get('year', '').strip()

        if brand:
            qs = qs.filter(brand__icontains=brand)
        if model:
            qs = qs.filter(model__icontains=model)
        if year:
            year_digits = ''.join(ch for ch in year if ch.isdigit())
            if len(year_digits) == 4:
                qs = qs.filter(year=int(year_digits))
            else:
                qs = qs.annotate(year_str=Cast('year', CharField())).filter(year_str__startswith=year_digits or year)

        return qs

    def get_permissions(self):
        if self.action in {'create', 'update', 'partial_update', 'destroy'}:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticatedOrReadOnly()]


class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = (permissions.IsAdminUser,)
    filterset_fields = ('code', 'active')
    search_fields = ('code',)
    ordering_fields = ('valid_from', 'valid_to', 'discount_value')


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

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        repuesto = serializer.validated_data.get('repuesto')
        existing = Review.objects.filter(user=request.user, repuesto=repuesto).first()

        if existing:
            existing.rating = serializer.validated_data.get('rating', existing.rating)
            existing.comment = serializer.validated_data.get('comment', existing.comment)
            existing.save()
            out = self.get_serializer(existing)
            return Response(out.data, status=status.HTTP_200_OK)

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def _ensure_owner(self, request, review):
        if review.user_id != request.user.id and not request.user.is_staff:
            raise PermissionDenied('No autorizado')

    def update(self, request, *args, **kwargs):
        review = self.get_object()
        self._ensure_owner(request, review)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        review = self.get_object()
        self._ensure_owner(request, review)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        review = self.get_object()
        self._ensure_owner(request, review)
        return super().destroy(request, *args, **kwargs)

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
            if now > coupon.valid_to and coupon.active:
                coupon.active = False
                coupon.save(update_fields=['active'])
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

        # Top selling products (más vendidos por cantidad y por revenue)
        top_products_qty = OrderItem.objects.values('name', 'sku', 'repuesto_id').annotate(
            total_sold=Sum('qty'),
            revenue=Sum(F('price') * F('qty'))
        ).order_by('-total_sold')[:10]

        top_products_revenue = OrderItem.objects.values('name', 'sku', 'repuesto_id').annotate(
            total_sold=Sum('qty'),
            revenue=Sum(F('price') * F('qty'))
        ).order_by('-revenue')[:10]

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

        # --- ANALYTICS AVANZADOS ---
        
        # Tasa de conversión (usuarios que compraron vs usuarios registrados)
        users_with_orders = Order.objects.values('user').distinct().count()
        conversion_rate = (users_with_orders / total_customers * 100) if total_customers > 0 else 0

        # Tasa de conversión últimos 30 días
        recent_users = User.objects.filter(date_joined__gte=thirty_days_ago, is_staff=False).count()
        recent_buyers = Order.objects.filter(created_at__gte=thirty_days_ago).values('user').distinct().count()
        conversion_rate_30d = (recent_buyers / recent_users * 100) if recent_users > 0 else 0

        # Valor promedio de orden
        avg_order_value = Order.objects.aggregate(avg=Sum('total'))['avg'] or 0
        if total_orders > 0:
            avg_order_value = float(total_revenue) / total_orders

        # Productos más vistos (tracking desde localStorage - esto es estimado por reviews/favorites)
        most_reviewed_products = Review.objects.values('repuesto__name', 'repuesto__id', 'repuesto__image').annotate(
            review_count=Count('id')
        ).order_by('-review_count')[:5]

        most_favorited_products = Favorite.objects.values('repuesto__name', 'repuesto__id', 'repuesto__image').annotate(
            favorite_count=Count('id')
        ).order_by('-favorite_count')[:5]

        # Tasa de abandono de carrito (estimación basada en items vs órdenes completadas)
        # Usuarios que agregaron items al carrito pero no compraron (estimado por usuarios sin órdenes recientes)
        total_users_active = User.objects.filter(is_staff=False, last_login__gte=thirty_days_ago).count()
        cart_abandonment_rate = ((total_users_active - recent_buyers) / total_users_active * 100) if total_users_active > 0 else 0

        # Distribución de órdenes por rango de precios
        price_ranges = [
            {'range': '0-500', 'count': Order.objects.filter(total__gte=0, total__lt=500).count()},
            {'range': '500-1000', 'count': Order.objects.filter(total__gte=500, total__lt=1000).count()},
            {'range': '1000-2500', 'count': Order.objects.filter(total__gte=1000, total__lt=2500).count()},
            {'range': '2500+', 'count': Order.objects.filter(total__gte=2500).count()},
        ]

        # Productos por categoría vendidos
        category_sales = OrderItem.objects.values('repuesto__category__name').annotate(
            total_sold=Sum('qty'),
            revenue=Sum(F('price') * F('qty'))
        ).order_by('-revenue')[:10]

        return Response({
            'revenue': {
                'total': float(total_revenue),
                'orders_count': total_orders,
            },
            'orders_by_status': list(orders_by_status),
            'sales_by_day': sales_by_day,
            'top_products': list(top_products_qty),
            'top_products_revenue': list(top_products_revenue),
            'low_stock': list(low_stock),
            'recent_orders': recent_orders_data,
            'summary': {
                'total_products': total_products,
                'total_orders': total_orders,
                'total_customers': total_customers,
                'low_stock_count': Repuesto.objects.filter(stock__lte=5).count(),
            },
            'analytics': {
                'conversion_rate': round(conversion_rate, 2),
                'conversion_rate_30d': round(conversion_rate_30d, 2),
                'avg_order_value': round(avg_order_value, 2),
                'cart_abandonment_rate': round(cart_abandonment_rate, 2),
                'users_with_orders': users_with_orders,
                'active_users_30d': total_users_active,
                'recent_buyers_30d': recent_buyers,
                'most_reviewed': list(most_reviewed_products),
                'most_favorited': list(most_favorited_products),
                'price_distribution': price_ranges,
                'category_sales': list(category_sales),
            }
        })

