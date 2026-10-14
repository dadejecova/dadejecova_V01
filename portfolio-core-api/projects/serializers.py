from rest_framework import serializers
from .models import Topic, Series, Lesson, LessonType, LessonCompletion

class TranslationSerializerMixin:
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        
        # Determine language (using header 'Accept-Language' or query param 'lang')
        lang = 'en'
        if request:
            if request.query_params.get('raw') == 'true':
                return ret
            lang = request.headers.get('Accept-Language', 'en').lower()
            if not lang or lang == 'undefined':
                lang = request.query_params.get('lang', 'en').lower()
        
        # Standardize lang code to first 2 characters
        lang = lang[:2] if lang else 'en'
        
        if lang == 'es':
            # 1. Translate basic fields if they exist in serialized representation and model has them
            for field in list(ret.keys()):
                es_field_name = f"{field}_es"
                if hasattr(instance, es_field_name):
                    es_val = getattr(instance, es_field_name)
                    if es_val:
                        ret[field] = es_val
            
            # 2. Translate related read-only fields
            if 'lesson_type_name' in ret and hasattr(instance, 'lesson_type') and instance.lesson_type and getattr(instance.lesson_type, 'name_es', None):
                ret['lesson_type_name'] = instance.lesson_type.name_es
            if 'topic_name' in ret and hasattr(instance, 'topic') and instance.topic and getattr(instance.topic, 'name_es', None):
                ret['topic_name'] = instance.topic.name_es
            if 'series_name' in ret and hasattr(instance, 'series') and instance.series and getattr(instance.series, 'name_es', None):
                ret['series_name'] = instance.series.name_es
                
        return ret


class TopicSerializer(TranslationSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'name', 'name_es', 'slug', 'description', 'description_es', 'image']

class LessonTypeSerializer(TranslationSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = LessonType
        fields = ['id', 'name', 'name_es', 'slug']

class LessonSerializer(TranslationSerializerMixin, serializers.ModelSerializer):
    # Optimizamos las ForeignKeys extrayendo sus nombres en texto
    lesson_type_name = serializers.ReadOnlyField(source='lesson_type.name')
    topic_name = serializers.ReadOnlyField(source='topic.name')
    series_name = serializers.ReadOnlyField(source='series.name')
    topic_slug = serializers.ReadOnlyField(source='topic.slug')
    series_slug = serializers.ReadOnlyField(source='series.slug')

    class Meta:
        model = Lesson
        fields = [
            'id', 
            'title', 'title_es',
            'slug', 
            'description', 'description_es',
            'content', 'content_es',
            'image', 
            'technology', 
            'repository_url', 
            'video_url',
            'created_at',
            'step_number',
            # Enviamos tanto el ID (para formularios) como el Nombre (para mostrar visualmente)
            'lesson_type', 'lesson_type_name',
            'topic', 'topic_name', 'topic_slug',
            'series', 'series_name', 'series_slug'
        ]
        read_only_fields = ['created_at']

class SeriesSerializer(TranslationSerializerMixin, serializers.ModelSerializer):
    topic_name = serializers.ReadOnlyField(source='topic.name')
    topic_slug = serializers.ReadOnlyField(source='topic.slug')
    lessons = LessonSerializer(many=True, read_only=True)
    
    total_lessons_count = serializers.SerializerMethodField()
    completed_lessons_count = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    next_lesson_slug = serializers.SerializerMethodField()

    class Meta:
        model = Series
        fields = [
            'id', 'name', 'name_es', 'slug', 'description', 'description_es', 'image', 'repository_url', 'topic', 'topic_name', 'topic_slug', 'lessons',
            'total_lessons_count', 'completed_lessons_count', 'progress_percentage', 'next_lesson_slug'
        ]

    def get_total_lessons_count(self, obj):
        return obj.lessons.count()

    def get_completed_lessons_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return LessonCompletion.objects.filter(user=request.user, lesson__series=obj).count()
        return 0

    def get_progress_percentage(self, obj):
        total = self.get_total_lessons_count(obj)
        if total == 0:
            return 0
        completed = self.get_completed_lessons_count(obj)
        return int((completed / total) * 100)

    def get_next_lesson_slug(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            completed_lesson_ids = LessonCompletion.objects.filter(
                user=request.user, 
                lesson__series=obj
            ).values_list('lesson_id', flat=True)
            
            next_lesson = obj.lessons.exclude(id__in=completed_lesson_ids).order_by('step_number').first()
            if next_lesson:
                return next_lesson.slug
        return None


class LessonCompletionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonCompletion
        fields = ['id', 'user', 'lesson', 'completed_at']
        read_only_fields = ['user', 'completed_at']


from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'is_active', 'date_joined', 'last_login']
        read_only_fields = ['date_joined', 'last_login']