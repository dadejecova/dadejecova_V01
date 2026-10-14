from rest_framework import serializers
from .models import Experience, Profile, Education, PersonalProject
from projects.serializers import TranslationSerializerMixin

class ProfileSerializer(TranslationSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'

class ExperienceSerializer(TranslationSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = '__all__'

class EducationSerializer(TranslationSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'

class PersonalProjectSerializer(TranslationSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = PersonalProject
        fields = '__all__'
