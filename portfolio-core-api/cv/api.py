from rest_framework import viewsets, permissions
from .models import Experience, Profile, Education, PersonalProject
from .serializers import ExperienceSerializer, ProfileSerializer, EducationSerializer, PersonalProjectSerializer
from core.permissions import IsAdminUserOrReadOnly

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    permission_classes = [IsAdminUserOrReadOnly]
    serializer_class = ProfileSerializer

class ExperienceViewSet(viewsets.ModelViewSet):
    queryset = Experience.objects.all()
    permission_classes = [IsAdminUserOrReadOnly]
    serializer_class = ExperienceSerializer

class EducationViewSet(viewsets.ModelViewSet):
    queryset = Education.objects.all()
    permission_classes = [IsAdminUserOrReadOnly]
    serializer_class = EducationSerializer

class PersonalProjectViewSet(viewsets.ModelViewSet):
    queryset = PersonalProject.objects.all()
    permission_classes = [IsAdminUserOrReadOnly]
    serializer_class = PersonalProjectSerializer