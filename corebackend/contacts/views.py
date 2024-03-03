from .models import Contact, ContactCategory, SubscribeLink
from .serializers import ContactSerializer, ContactCategorySerializer
from common.helpers import DefaultPagination, IsOwnerPermission, viewset_initiliaze 
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions

ContactViewSet = viewset_initiliaze(Contact, ContactSerializer, filters=["categories"])
ContactCategoryViewSet = viewset_initiliaze(ContactCategory, ContactCategorySerializer)

class ContactViewSet(viewsets.ModelViewSet):
    serializer_class = ContactSerializer
    pagination_class = DefaultPagination
    permission_classes = [
        permissions.IsAuthenticated,
        IsOwnerPermission,
    ]
        
    
    def create(self, request, *args, **kwargs):
        user = request.user
        data = request.data
        is_mutliple = request.GET.get("type") == "multiple"
        uploaded = []
        duplicate_total = 0
        skipped_total = 0
        
        if is_mutliple:
            contacts = data.get("contacts", [])
            options = data.get("options")
            category_id = data.get("category_id")
            category = None
            if category_id:
                category = get_object_or_404(ContactCategory, id=category_id, user=user)
                
            if len(contacts) > 10:
                return Response({"message": "You can only upload max of 10 contacts at once"}, status=401)
            for contact in contacts:
                serializer= ContactSerializer(data=contact, context={ "request": request})
                if serializer.is_valid():
                    contact = Contact.objects.filter(user=user, email=serializer.validated_data["email"]).first()
                    if not contact:
                        contact = serializer.save(user=user)
                        uploaded.append(serializer.data) 
                    elif options.get("duplicate") == "skip":
                        skipped_total += 1
                        continue
                    elif options.get("duplicate") =="update":
                        contact.first_name = serializer.validated_data["first_name"]
                        contact.last_name = serializer.validated_data["last_name"]
                        contact.company = serializer.validated_data["company"]
                        contact.save()
                        duplicate_total +=1
                        
                    if category:
                        contact.categories.add(category)
                    
                else:
                    skipped_total += 1                    
            return Response({
                "uploaded": uploaded,
                "duplicate_total": duplicate_total,
                "skipped_total": skipped_total
            })  
        
        
        else:
            return super().create(request, *args, **kwargs)
          
    def get_queryset(self):
        return Contact.objects.filter(user=self.request.user)   
    
    
    
    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(user=user)
    

@api_view(['POST', 'GET'])
@permission_classes([])
def subscribe_link(request, id):
    link = get_object_or_404(SubscribeLink, id=id, is_active=True)
    if request.method == 'GET':
        return Response(link.to_json())
    
    if request.method == 'POST':
       
        serializer = ContactSerializer(data={**request.data, "categories": [link.category.id]}, context={"request": request})
        if serializer.is_valid(raise_exception=True):
            contact = Contact.objects.filter(user=link.category.user, email=request.data["email"], categories=link.category.id).first()
            if contact:
                contact.first_name = request.data["first_name"]
                contact.last_name = request.data["last_name"]
                contact.save()
            else:
                contact = serializer.save(user=link.category.user)
                contact.categories.add(link.category)
            return Response(serializer.data)