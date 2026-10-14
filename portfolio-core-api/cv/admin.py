from django.contrib import admin
from .models import Experience, Profile, Education, PersonalProject

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('title', 'title_es', 'email')
    fieldsets = (
        ('Información Principal (English)', {
            'fields': ('name', 'title', 'bio', 'avatar', 'cv_file')
        }),
        ('Traducción (Spanish)', {
            'fields': ('title_es', 'bio_es'),
        }),
        ('Redes Sociales', {
            'fields': ('github_url', 'linkedin_url', 'email')
        }),
    )

@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('position', 'position_es', 'company', 'start_date', 'is_current')
    list_filter = ('is_current', 'company')
    fieldsets = (
        ('Información Principal (English)', {
            'fields': ('company', 'position', 'description', 'start_date', 'end_date', 'is_current')
        }),
        ('Traducción (Spanish)', {
            'fields': ('position_es', 'description_es'),
        }),
    )

@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ('degree', 'degree_es', 'institution', 'start_date', 'is_current')
    fieldsets = (
        ('Información Principal (English)', {
            'fields': ('institution', 'degree', 'description', 'start_date', 'end_date', 'is_current')
        }),
        ('Traducción (Spanish)', {
            'fields': ('degree_es', 'description_es'),
        }),
    )

@admin.register(PersonalProject)
class PersonalProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'order')
    ordering = ('order', '-id')
    fieldsets = (
        ('Información Principal (English)', {
            'fields': ('name', 'short_description', 'description', 'image', 'repository_url', 'demo_url', 'technologies', 'order')
        }),
        ('Traducción (Spanish)', {
            'fields': ('short_description_es', 'description_es'),
        }),
    )