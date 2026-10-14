from django.contrib import admin
from .models import Lesson, Topic, Series, LessonType, StudentProfile

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('name', 'name_es', 'slug')
    search_fields = ('name', 'name_es', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Series)
class SubTopicAdmin(admin.ModelAdmin):
    list_display = ('topic', 'name', 'name_es', 'description')
    search_fields = ('topic__name', 'name', 'name_es')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(LessonType)
class LessonTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'name_es', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    # Columnas que verás en la lista principal
    list_display = ('title', 'title_es', 'technology', 'created_at')
    # Buscador por título, título en español y tecnología
    search_fields = ('title', 'title_es', 'technology')
    # Autocompletar el slug basado en el título
    prepopulated_fields = {'slug': ('title',)}
    # Filtro lateral
    list_filter = ('technology', 'created_at')

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'country', 'city', 'tier', 'preferred_track', 'last_active')
    list_filter = ('tier', 'preferred_track', 'country')
    search_fields = ('user__username', 'user__email', 'country', 'city')
