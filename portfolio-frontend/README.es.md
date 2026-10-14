# Frontend - Cliente Web (Next.js y React)

[Read in English](README.md)

Este directorio contiene la interfaz de usuario moderna para la Plataforma Dadejecova. Desarrollado con **Next.js 16 (App Router)** y **TailwindCSS**, ofrece navegación rápida, diseño responsivo y capacidades interactivas para estudiantes registrados.

## Tecnologías Principales
- **Framework:** Next.js 16 (React 19) con App Router
- **Estilos:** TailwindCSS
- **Autenticación:** Gestión de JWT mediante Fetch API y decodificación en cliente con `jwt-decode`
- **Markdown y Código:** `react-markdown` y `remark-gfm` para contenido técnico enriquecido

## Arquitectura de Rutas y Navegación

El sistema utiliza rutas dinámicas anidadas que reflejan la jerarquía de la base de datos (Tema > Serie > Lección):

### Rutas Públicas e Interactivas
- `/`: **Página Principal**. Muestra las categorías (Topics) disponibles.
- `/topics/[topicSlug]`: Lista las Series (Cursos) publicadas bajo un tema específico.
- `/topics/[topicSlug]/[seriesSlug]/[lessonSlug]`: **Aula Virtual**. Renderiza el contenido en Markdown, reproductor de video condicional (YouTube/Vimeo) y barra lateral con el índice de lecciones para marcar progreso.
- `/aboutme`: **Currículum Dinámico**. Línea de tiempo alimentada por la API (Experiencia y Educación) y galería de proyectos personales.
- `/search`: Buscador global conectado a las lecciones.

### Sistema de Usuarios
- `/register`: Registro para nuevos estudiantes.
- `/login`: Inicio de sesión seguro.

### Panel de Administración CMS (Protegido)
Protegido por verificación de token JWT (`is_staff`):
- `/dashboard`: Panel de bienvenida y estadísticas.
- `/dashboard/topics` y `/dashboard/series`: Gestión de la estructura de cursos.
- `/dashboard/lessons`: Editor de tutoriales con Markdown y subida de imágenes.
- `/dashboard/experiences` y `/dashboard/education`: Gestores de la línea de tiempo del CV.
- `/dashboard/projects`: Subida de proyectos personales con capturas de pantalla.

## Guía de Desarrollo Local

### Instalación
```bash
# Instalar todas las dependencias
npm install
```

### Ejecución
```bash
# Correr el servidor local de desarrollo en el puerto 3000
npm run dev
```

Asegúrate de que el backend (Django) esté corriendo en `http://localhost:8000` para que el frontend pueda consumir la API exitosamente.
