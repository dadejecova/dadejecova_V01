# Backend - Core API (Django & DRF)

[Read in English](README.md)

Este directorio contiene el código fuente del Backend para la Plataforma Dadejecova. Construido con **Django** y **Django REST Framework (DRF)**, este sistema maneja toda la lógica de negocio, autenticación, persistencia en base de datos e integraciones con IA.

## Tecnologías Principales
- **Framework:** Django 5.x
- **Motor API:** Django REST Framework (DRF)
- **Base de Datos:** PostgreSQL 15
- **Autenticación:** JWT sin estado mediante `djangorestframework-simplejwt`
- **Servicio de IA:** SDK de Google Gemini AI
- **Infraestructura:** Docker y Docker Compose con proxy inverso Nginx

## Arquitectura del Sistema

El backend está dividido lógicamente en tres dominios principales:

### 1. Sistema Educativo (`projects` app)
Maneja la organización de los cursos bajo un modelo jerárquico estructurado:
- `Topic`: Tema principal (Ej: Python, React).
- `Series`: Colección secuencial de lecciones dentro de un tema.
- `Lesson`: Contenido individual con soporte para Markdown y URLs de Video.
- `LessonCompletion`: Rastrea el progreso individual de cada usuario.

### 2. Gestión de Currículum (`cv` app)
Alimenta dinámicamente la información profesional mostrada en el frontend:
- `Profile`: Información de contacto, bio y avatar.
- `Experience`: Historial laboral.
- `Education`: Formación académica.
- `PersonalProject`: Proyectos destacados del portafolio.

### 3. Autenticación y Control de Roles
- **Tokens sin estado:** Tokens de acceso con validez de 7 días y rotación de refresco a 30 días.
- **Sistema de roles:** El token contiene el atributo `is_staff` para diferenciar al administrador de los estudiantes registrados, protegiendo las rutas de escritura del CMS.

## Endpoints Principales de la API

| Endpoint | Métodos | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `/api/register/` | POST | Registro de nuevos estudiantes | Público |
| `/api/token/` | POST | Login - Obtener access y refresh tokens | Público |
| `/api/token/refresh/` | POST | Renovar token de acceso expirado | Público |
| `/api/lessons/` | GET, POST, DELETE | Gestión y lectura de lecciones | Público (Lectura), Admin (Escritura) |
| `/api/progress/` | GET, POST, DELETE | Rastreo de lecciones completadas | Usuarios Autenticados |
| `/api/experiences/` | GET, POST, DELETE | Historial laboral | Público (Lectura), Admin (Escritura) |
| `/api/ai/explain-code/` | POST | Explicación de código mediante IA | Usuarios Autenticados |
| `/api/lessons/<slug>/quiz/` | POST | Cuestionario interactivo generado por IA | Usuarios Autenticados |

## Guía de Desarrollo Local

### Ejecución con Docker Compose
```bash
# 1. Construir y levantar contenedores en segundo plano
docker-compose up --build -d

# 2. Aplicar migraciones a la base de datos
docker-compose exec web python manage.py migrate

# 3. Crear superusuario (Admin)
docker-compose exec web python manage.py createsuperuser
```

### Comandos útiles de mantenimiento
```bash
# Generar nuevas migraciones tras editar models.py
docker-compose exec web python manage.py makemigrations

# Ver registros de ejecución del contenedor
docker-compose logs -f web
```
