from django.core.paginator import InvalidPage
from rest_framework.pagination import PageNumberPagination


class SafePageNumberPagination(PageNumberPagination):
    """Clamp out-of-range pages to the nearest valid page instead of raising 404."""

    def paginate_queryset(self, queryset, request, view=None):
        self.request = request
        page_size = self.get_page_size(request)
        if not page_size:
            return None

        paginator = self.django_paginator_class(queryset, page_size)
        page_number = request.query_params.get(self.page_query_param, 1)

        if page_number in self.last_page_strings:
            page_number = paginator.num_pages

        try:
            self.page = paginator.page(page_number)
        except InvalidPage:
            # Clamp to last page (or first if paginator has no pages)
            try:
                self.page = paginator.page(paginator.num_pages)
            except InvalidPage:
                self.page = paginator.page(1)

        self.display_page_controls = paginator.num_pages > 1
        return list(self.page)
