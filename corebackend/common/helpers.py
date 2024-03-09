import re, json
from rest_framework import viewsets, permissions
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.response import Response

def generate_message(template, parameters):
    message = template

    for param, value in parameters.items():
        regex = re.compile(r'{{\s*' + re.escape(param) + r'\s*}}', flags=re.IGNORECASE)
        message = regex.sub(str(value), message)

    return message

def build_mail_from_template(template, row, default_values):
    parameters = {}
    for param_name, param_value in row.items():
       
        if(param_value['willUseDefaultValue']):
            parameters[param_name] = default_values[param_name]
        else:
            parameters[param_name] = param_value['currentValue']
    s_mail = generate_message(template, parameters)
    return json.loads(s_mail)


class DefaultPagination(LimitOffsetPagination):
    max_limit = 10  
    def get_paginated_response(self, data):
        return Response({
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
                'count': self.count,
                'results': data
            })
        
class IsOwnerPermission(permissions.IsAuthenticated):
    """
    Object-level permission to only allow updating his own profile
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user



def viewset_initiliaze(Model, ModelSerializer, filters=[], search_fields=[]):
    
    class APIView(viewsets.ModelViewSet):
        serializer_class = ModelSerializer
        pagination_class = DefaultPagination
        permission_classes = [
            permissions.IsAuthenticated,
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