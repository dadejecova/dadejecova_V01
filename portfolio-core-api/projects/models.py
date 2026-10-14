from django.db import models
from django.utils.text import slugify
from django.db.models import Max
from .translation_helper import translate_to_spanish

class Topic(models.Model):
    name = models.CharField(max_length=100)
    name_es = models.CharField(max_length=100, blank=True, null=True, help_text="Nombre en Español")
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, null=True, help_text="Breve Descripción")
    description_es = models.TextField(blank=True, null=True, help_text="Descripción en Español")
    image = models.ImageField(upload_to='topics/', blank=True, null=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
            
        if not self.pk:
            if not self.name_es:
                self.name_es = translate_to_spanish(self.name)
            if not self.description_es:
                self.description_es = translate_to_spanish(self.description)
        else:
            try:
                old = Topic.objects.get(pk=self.pk)
                if old.name != self.name or not self.name_es:
                    self.name_es = translate_to_spanish(self.name)
                if old.description != self.description or not self.description_es:
                    self.description_es = translate_to_spanish(self.description)
            except Topic.DoesNotExist:
                pass
                
        super().save(*args, **kwargs)

class Series(models.Model):
    topic = models.ForeignKey(Topic, related_name='series', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    name_es = models.CharField(max_length=200, blank=True, null=True, help_text="Nombre en Español")
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    description_es = models.TextField(blank=True, null=True, help_text="Descripción en Español")
    image = models.ImageField(upload_to='series/', blank=True, null=True)
    repository_url = models.URLField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Series"

    def __str__(self):
        return f"{self.topic.name} - {self.name}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
            
        if not self.pk:
            if not self.name_es:
                self.name_es = translate_to_spanish(self.name)
            if not self.description_es:
                self.description_es = translate_to_spanish(self.description)
        else:
            try:
                old = Series.objects.get(pk=self.pk)
                if old.name != self.name or not self.name_es:
                    self.name_es = translate_to_spanish(self.name)
                if old.description != self.description or not self.description_es:
                    self.description_es = translate_to_spanish(self.description)
            except Series.DoesNotExist:
                pass
                
        super().save(*args, **kwargs)

class LessonType(models.Model):
    name = models.CharField(max_length=100, help_text="Ej: Tutorial de Programación, Microservicio, etc.")
    name_es = models.CharField(max_length=100, blank=True, null=True, help_text="Nombre en Español")
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.pk:
            if not self.name_es:
                self.name_es = translate_to_spanish(self.name)
        else:
            try:
                old = LessonType.objects.get(pk=self.pk)
                if old.name != self.name or not self.name_es:
                    self.name_es = translate_to_spanish(self.name)
            except LessonType.DoesNotExist:
                pass
        super().save(*args, **kwargs)

class Lesson(models.Model):
    
    topic = models.ForeignKey(Topic, related_name='lessons', on_delete=models.SET_NULL, null=True, blank=True)
    # Conectamos la lección a una serie. null=True por si es una lección suelta que no es parte de un curso.
    series = models.ForeignKey(Series, related_name='lessons', on_delete=models.SET_NULL, null=True, blank=True)
    # Creamos el tipo de lección
    lesson_type = models.ForeignKey(LessonType, related_name='lessons', on_delete=models.SET_NULL, null=True)

    step_number = models.PositiveIntegerField(null=True, blank=True, help_text="El orden en la serie (Ej: Parte 1, Parte 2)")
    
    title = models.CharField(max_length=200)
    title_es = models.CharField(max_length=200, blank=True, null=True, help_text="Título en Español")
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    image = models.ImageField(upload_to='lessons/', blank=True, null=True)
    video_url = models.URLField(blank=True, null=True, help_text="URL de YouTube, Vimeo, etc.")
    description = models.TextField()
    description_es = models.TextField(blank=True, null=True, help_text="Descripción en Español")
    content = models.TextField(help_text="Contenido en Markdown")
    content_es = models.TextField(blank=True, null=True, help_text="Contenido en Markdown (Español)")
    technology = models.CharField(max_length=100)
    repository_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    ai_quiz_cache = models.JSONField(blank=True, null=True)

    class Meta:
        # Esto le dice a Django: "Siempre devuelve las lecciones ordenadas por su número de paso"
        ordering = ['step_number', '-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['series', 'step_number'], 
                name='unique_step_per_series'
            )
        ]

    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if self.pk:
            try:
                old_self = Lesson.objects.get(pk=self.pk)
                if old_self.content != self.content or old_self.title != self.title:
                    self.ai_quiz_cache = None
            except Lesson.DoesNotExist:
                pass

        if not self.slug:
            self.slug = slugify(self.title)

        if self.series and not self.step_number:
            # Buscamos el número de paso más alto en esa serie
            last_step = Lesson.objects.filter(series=self.series).aggregate(Max('step_number'))['step_number__max']
            # Si no hay lecciones, empezamos en 1. Si las hay, sumamos 1 al máximo.
            self.step_number = (last_step or 0) + 1

        # Auto-translation
        if not self.pk:
            if not self.title_es:
                self.title_es = translate_to_spanish(self.title)
            if not self.description_es:
                self.description_es = translate_to_spanish(self.description)
            if not self.content_es:
                self.content_es = translate_to_spanish(self.content, is_markdown=True)
        else:
            try:
                old = Lesson.objects.get(pk=self.pk)
                if old.title != self.title or not self.title_es:
                    self.title_es = translate_to_spanish(self.title)
                if old.description != self.description or not self.description_es:
                    self.description_es = translate_to_spanish(self.description)
                if old.content != self.content or not self.content_es:
                    self.content_es = translate_to_spanish(self.content, is_markdown=True)
            except Lesson.DoesNotExist:
                pass

        super().save(*args, **kwargs)

from django.contrib.auth.models import User

class LessonCompletion(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='completed_lessons')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='completions')
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'lesson')

    def __str__(self):
        return f"{self.user.username} completó {self.lesson.title}"

class CodeExplanationCache(models.Model):
    code_hash = models.CharField(max_length=64, unique=True, db_index=True)
    code_text = models.TextField()
    language = models.CharField(max_length=50)
    explanation_json = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cache for {self.language} code ({self.code_hash[:8]})"


class StudentProfile(models.Model):
    TIER_CHOICES = [
        ('free', 'Free Student'),
        ('sponsor', 'Sponsor/Donor'),
        ('premium', 'Premium User'),
    ]
    
    TRACK_CHOICES = [
        ('frontend', 'Frontend'),
        ('backend', 'Backend'),
        ('data_engineering', 'Data Engineering'),
        ('fullstack', 'Full Stack'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    country = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    
    tier = models.CharField(max_length=50, default='free', choices=TIER_CHOICES)
    preferred_track = models.CharField(max_length=100, blank=True, null=True, choices=TRACK_CHOICES)
    github_username = models.CharField(max_length=150, blank=True, null=True)
    
    last_active = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.username} ({self.get_tier_display()})"


from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_student_profile(sender, instance, created, **kwargs):
    if created:
        StudentProfile.objects.create(user=instance)