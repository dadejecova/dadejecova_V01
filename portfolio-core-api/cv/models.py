from django.db import models
from projects.translation_helper import translate_to_spanish

class Profile(models.Model):
    name = models.CharField(max_length=150, help_text="Tu nombre principal")
    title = models.CharField(max_length=200, help_text="Tu título profesional, ej: Ingeniero de Software")
    title_es = models.CharField(max_length=200, blank=True, null=True, help_text="Título profesional en Español")
    bio = models.TextField(help_text="Texto principal sobre ti")
    bio_es = models.TextField(blank=True, null=True, help_text="Texto principal sobre ti en Español")
    avatar = models.ImageField(upload_to='cv/avatar/', blank=True, null=True)
    cv_file = models.FileField(upload_to='cv/docs/', blank=True, null=True, help_text="Sube tu CV en PDF")
    github_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    class Meta:
        verbose_name = "Perfil"
        verbose_name_plural = "Perfiles"

    def __str__(self):
        return f"Perfil: {self.title}"

    def save(self, *args, **kwargs):
        if not self.pk:
            if not self.title_es:
                self.title_es = translate_to_spanish(self.title)
            if not self.bio_es:
                self.bio_es = translate_to_spanish(self.bio)
        else:
            try:
                old = Profile.objects.get(pk=self.pk)
                if old.title != self.title or not self.title_es:
                    self.title_es = translate_to_spanish(self.title)
                if old.bio != self.bio or not self.bio_es:
                    self.bio_es = translate_to_spanish(self.bio)
            except Profile.DoesNotExist:
                pass
        super().save(*args, **kwargs)

class Experience(models.Model):
    company = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    position_es = models.CharField(max_length=100, blank=True, null=True, help_text="Cargo en Español")
    description = models.TextField()
    description_es = models.TextField(blank=True, null=True, help_text="Descripción en Español")
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)

    class Meta:
        ordering = ['-start_date']
        verbose_name = "Experiencia"
        verbose_name_plural = "Experiencias"

    def __str__(self):
        return f"{self.position} en {self.company}"

    def save(self, *args, **kwargs):
        if not self.pk:
            if not self.position_es:
                self.position_es = translate_to_spanish(self.position)
            if not self.description_es:
                self.description_es = translate_to_spanish(self.description)
        else:
            try:
                old = Experience.objects.get(pk=self.pk)
                if old.position != self.position or not self.position_es:
                    self.position_es = translate_to_spanish(self.position)
                if old.description != self.description or not self.description_es:
                    self.description_es = translate_to_spanish(self.description)
            except Experience.DoesNotExist:
                pass
        super().save(*args, **kwargs)

class Education(models.Model):
    institution = models.CharField(max_length=150)
    degree = models.CharField(max_length=150)
    degree_es = models.CharField(max_length=150, blank=True, null=True, help_text="Título/Grado en Español")
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True, null=True)
    description_es = models.TextField(blank=True, null=True, help_text="Descripción en Español")

    class Meta:
        ordering = ['-start_date']
        verbose_name = "Educación"
        verbose_name_plural = "Educación"

    def __str__(self):
        return f"{self.degree} en {self.institution}"

    def save(self, *args, **kwargs):
        if not self.pk:
            if not self.degree_es:
                self.degree_es = translate_to_spanish(self.degree)
            if not self.description_es and self.description:
                self.description_es = translate_to_spanish(self.description)
        else:
            try:
                old = Education.objects.get(pk=self.pk)
                if old.degree != self.degree or not self.degree_es:
                    self.degree_es = translate_to_spanish(self.degree)
                if (old.description != self.description or not self.description_es) and self.description:
                    self.description_es = translate_to_spanish(self.description)
            except Education.DoesNotExist:
                pass
        super().save(*args, **kwargs)

class PersonalProject(models.Model):
    name = models.CharField(max_length=150)
    short_description = models.CharField(max_length=250)
    short_description_es = models.CharField(max_length=250, blank=True, null=True, help_text="Descripción corta en Español")
    description = models.TextField(blank=True, null=True)
    description_es = models.TextField(blank=True, null=True, help_text="Descripción detallada en Español")
    image = models.ImageField(upload_to='cv/projects/', blank=True, null=True)
    repository_url = models.URLField(blank=True, null=True)
    demo_url = models.URLField(blank=True, null=True)
    technologies = models.CharField(max_length=200, help_text="Ej: React, Django, Docker")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', '-id']
        verbose_name = "Proyecto Personal"
        verbose_name_plural = "Proyectos Personales"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.pk:
            if not self.short_description_es:
                self.short_description_es = translate_to_spanish(self.short_description)
            if not self.description_es and self.description:
                self.description_es = translate_to_spanish(self.description)
        else:
            try:
                old = PersonalProject.objects.get(pk=self.pk)
                if old.short_description != self.short_description or not self.short_description_es:
                    self.short_description_es = translate_to_spanish(self.short_description)
                if (old.description != self.description or not self.description_es) and self.description:
                    self.description_es = translate_to_spanish(self.description)
            except PersonalProject.DoesNotExist:
                pass
        super().save(*args, **kwargs)