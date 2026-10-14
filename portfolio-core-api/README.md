# Backend - Core API (Django & DRF)

[Leer en Español](README.es.md)

This repository contains the backend source code for the Dadejecova Platform. Built with **Django** and **Django REST Framework (DRF)**, this service manages all business logic, authentication, database persistence, and AI integrations.

## Core Technologies
- **Framework:** Django 5.x
- **API Engine:** Django REST Framework (DRF)
- **Database:** PostgreSQL 15
- **Authentication:** Stateless JWT via `djangorestframework-simplejwt`
- **AI Service:** Google Gemini AI SDK
- **Infrastructure:** Docker & Docker Compose with Nginx reverse proxy

## System Architecture

The backend is modularized into three core application domains:

### 1. Educational LMS (`projects` app)
Manages course content under a structured hierarchical model:
- `Topic`: Top-level subject area (e.g., Python, React).
- `Series`: Sequential curriculum path within a specific topic.
- `Lesson`: Individual learning unit supporting Markdown content and video URLs.
- `LessonCompletion`: Tracks completed lessons per authenticated user.

### 2. Curriculum Vitae (`cv` app)
Dynamically feeds professional profile data to the client:
- `Profile`: Bio, contact details, and avatar references.
- `Experience`: Career and employment history.
- `Education`: Academic qualifications.
- `PersonalProject`: Featured portfolio projects.

### 3. Authentication and Role-Based Access Control
- **Stateless Tokens:** Access tokens issue a 7-day validity with 30-day refresh cycle.
- **RBAC:** Tokens carry the `is_staff` claim to distinguish public students from administrative owners, protecting CMS write endpoints.

## Primary API Endpoints

| Endpoint | Methods | Description | Access |
| :--- | :--- | :--- | :--- |
| `/api/register/` | POST | Student account registration | Public |
| `/api/token/` | POST | Login - Generate access and refresh tokens | Public |
| `/api/token/refresh/` | POST | Refresh expired access tokens | Public |
| `/api/lessons/` | GET, POST, DELETE | Read and manage educational lessons | Public (Read), Staff (Write) |
| `/api/progress/` | GET, POST, DELETE | Track completed lessons | Authenticated Users |
| `/api/experiences/` | GET, POST, DELETE | Career history records | Public (Read), Staff (Write) |
| `/api/ai/explain-code/` | POST | AI explanation for lesson code snippets | Authenticated Users |
| `/api/lessons/<slug>/quiz/` | POST | AI-generated interactive lesson quiz | Authenticated Users |

## Local Development Guide

### Running with Docker Compose
```bash
# 1. Start containers in the background
docker-compose up --build -d

# 2. Run database migrations
docker-compose exec web python manage.py migrate

# 3. Create an administrator account
docker-compose exec web python manage.py createsuperuser
```

### Useful Maintenance Commands
```bash
# Generate migrations after modifying models
docker-compose exec web python manage.py makemigrations

# Check container logs
docker-compose logs -f web
```
