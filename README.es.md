# Plataforma Dadejecova v1.0 (Monorepo)

[Read in English](README.md)

> Plataforma Educativa Full-Stack y Portafolio Dinámico de Desarrollador  
> Construido con Next.js 16 (App Router), Django 5 (REST Framework), PostgreSQL, Docker y Google Gemini AI.

---

## Descripción General

La Plataforma Dadejecova v1.0 es una aplicación web interactiva de arquitectura completa, diseñada para combinar la presentación de un portafolio técnico con un sistema de gestión de aprendizaje estructurado.

Funcionalidades principales:
- **Plan de Estudios de Cursos:** Estructura jerárquica (Temas, Series y Lecciones) con soporte para renderizado enriquecido de Markdown, resaltado de sintaxis, videos incrustados y seguimiento del progreso de cada usuario.
- **Portafolio Dinámico (CV):** Línea de tiempo alimentada por base de datos con experiencia laboral, educación académica, habilidades y proyectos destacados.
- **Tutoría con Asistencia de IA:** Explicación contextual de código y generación dinámica de cuestionarios impulsada por Google Gemini AI.
- **Control de Acceso Basado en Roles (RBAC):** Autenticación sin estado mediante JWT que distingue a estudiantes públicos de administradores con panel CMS protegido.
- **Monorepo Unificado:** Alojamiento de la API backend y el cliente frontend en un único repositorio para garantizar alineación de versiones, facilitar el despliegue local y permitir ejecución en la nube mediante GitHub Codespaces.

---

## Arquitectura y Estructura del Repositorio

```
dadejecova_V01/
├── .devcontainer/              # Configuración para entorno en la nube (GitHub Codespaces)
│   └── devcontainer.json
├── portfolio-core-api/         # Backend: Django 5 + Django REST Framework + PostgreSQL
│   ├── ai_tutor/               # Servicio Gemini AI para explicaciones de código y tests
│   ├── core/                   # Configuración de Django, JWT y enrutamiento URL
│   ├── cv/                     # Modelos de perfil, experiencia, educación y proyectos
│   ├── projects/               # Modelos, serializadores y vistas del sistema educativo
│   ├── Dockerfile              # Definición de contenedor para el servicio web
│   ├── docker-compose.yml      # Orquestación multi-contenedor (Django, Postgres, Nginx)
│   ├── requirements.txt        # Especificación de dependencias de Python
│   ├── README.md               # Documentación del backend (Inglés)
│   ├── README.es.md            # Documentación del backend (Español)
│   └── .env.example            # Plantilla de variables de entorno
├── portfolio-frontend/         # Frontend: Next.js 16 + React 19 + TailwindCSS
│   ├── src/app/                # App Router (páginas: /, /topics, /aboutme, /dashboard)
│   ├── src/components/         # Componentes UI reutilizables y layouts
│   ├── package.json            # Dependencias y scripts de Node.js
│   ├── README.md               # Documentación del frontend (Inglés)
│   ├── README.es.md            # Documentación del frontend (Español)
│   └── .env.example            # Plantilla de variables de entorno frontend
├── .gitignore                  # Reglas raíz para excluir secretos y dependencias
├── README.md                   # Documentación principal (Inglés)
└── README.es.md                # Documentación principal (Español)
```

---

## Pila Tecnológica

| Dominio | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Framework Frontend** | Next.js 16 (App Router) | Arquitectura React 19 con componentes de servidor y cliente |
| **Estilos** | TailwindCSS | Sistema de diseño responsivo |
| **Framework Backend** | Django 5.0 + DRF | API REST en Python con ORM avanzado |
| **Base de Datos** | PostgreSQL 15 | Almacenamiento relacional para cursos, perfiles y progreso |
| **Autenticación** | SimpleJWT | Tokens JSON Web sin estado con rotación de refresh |
| **Integración de IA** | Google Gemini AI | Explicación de código y generación de cuestionarios |
| **Contenedores** | Docker y Docker Compose | Entorno multi-contenedor con proxy inverso Nginx |
| **Entorno en la Nube** | GitHub Codespaces | Contenedor de desarrollo ejecutable en el navegador con un clic |

---

## Guía Rápida de Instalación y Ejecución

Existen tres formas de ejecutar este proyecto: **GitHub Codespaces**, **Docker Compose** o **Instalación Local Manual**.

### Opción 1: GitHub Codespaces (Directo en el Navegador)

1. Ve a la página principal del repositorio en GitHub.
2. Haz clic en el botón verde **Code**, selecciona la pestaña **Codespaces** y haz clic en **Create codespace on main**.
3. Una vez termine de iniciar el contenedor en la nube:
   - Python y Node.js estarán listos para usar.
   - Inicia los servicios de backend y frontend en terminales separadas.
   - El puerto 3000 mostrará automáticamente un enlace clickable para ver la aplicación web.

---

### Opción 2: Docker Compose (Recomendado para Desarrollo Local)

Requisitos: Tener instalado [Docker Desktop](https://www.docker.com/).

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/dadejecova/dadejecova_V01.git
   cd dadejecova_V01
   ```

2. **Configurar las variables de entorno:**
   ```bash
   # Configuración del backend
   cp portfolio-core-api/.env.example portfolio-core-api/.env

   # Configuración del frontend
   cp portfolio-frontend/.env.example portfolio-frontend/.env.local
   ```

3. **Iniciar los contenedores de backend y base de datos:**
   ```bash
   cd portfolio-core-api
   docker-compose up --build -d
   ```

4. **Aplicar las migraciones y crear el usuario administrador:**
   ```bash
   docker-compose exec web python manage.py migrate
   docker-compose exec web python manage.py createsuperuser
   ```

5. **Iniciar la aplicación frontend:**
   ```bash
   cd ../portfolio-frontend
   npm install
   npm run dev
   ```

6. **Abrir en el navegador:**
   - Aplicación Frontend: http://localhost:3000
   - API Backend: http://localhost:8000/api/
   - Panel de Administración: http://localhost:8000/naxxramas-vault/

---

### Opción 3: Instalación Local Manual (Sin Docker)

<details>
<summary>Ver instrucciones de instalación manual</summary>

#### 1. Configuración del Backend (Django)
```bash
cd portfolio-core-api
python -m venv venv

# Windows
.\venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Configura .env con tus credenciales locales de PostgreSQL

python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

#### 2. Configuración del Frontend (Next.js)
```bash
cd portfolio-frontend
cp .env.example .env.local
npm install
npm run dev
```

</details>

---

## Seguridad y Configuración

- **Cero Exposición de Credenciales:** Claves secretas, contraseñas de bases de datos y API keys están estrictamente excluidas mediante `.gitignore`.
- **Plantillas de Entorno:** Los desarrolladores deben generar sus archivos `.env` y `.env.local` a partir de las plantillas `.env.example`.
- **Ciclo de Autenticación:** Los tokens de acceso expiran en 7 días con rotación cada 30 días. Las acciones administrativas se validan en el servidor mediante el atributo `is_staff`.

---

## Autor

**Daniel Coello (`dadejecova`)**  
- GitHub: https://github.com/dadejecova  
- Especialidad: Sistemas Full-Stack, Arquitectura de Software e Inteligencia Artificial Aplicada

---

## Licencia

Este proyecto está bajo la Licencia MIT.
