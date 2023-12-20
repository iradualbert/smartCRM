from .models import Contact, ContactCategory
from .serializers import ContactSerializer, ContactCategorySerializer
from rest_framework import viewsets, permissions
from rest_framework.pagination import LimitOffsetPagination, PageNumberPagination
from rest_framework.response import Response


class DefaultPagination(PageNumberPagination):
    max_limit = 20  
    def get_paginated_response(self, data):
        return Response({
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
                'count': self.page.paginator.count,
                'results': data
            })
        
class IsOwnerPermission(permissions.BasePermission):
    """
    Object-level permission to only allow updating his own profile
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
    
def viewset_init(Model, ModelSerializer, filters=[], search_fields=[]):
    
    class APIView(viewsets.ModelViewSet):
        serializer_class = ModelSerializer
        pagination_class = DefaultPagination
        permission_classes = [
            IsOwnerPermission,
        ]
        
        def get_queryset(self):
            filter_obj = {}
            for x in filters:
                value = self.request.GET.get(x)
                if value:
                    filter_obj[x] = value
            return Model.objects.filter(user=self.request.user, **filter_obj)
        
        def perform_create(self, serializer):
            user = self.request.user
            serializer.save(user=user)
        
    
        
    APIView.__name__ = Model.__name__  + "API"
    return APIView

ContactViewSet = viewset_init(Contact, ContactSerializer, filters=["categories"])
ContactCategoryViewSet = viewset_init(ContactCategory, ContactCategorySerializer)