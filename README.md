# Dadejecova Platform v1.0 (Monorepo)

[Leer en Español](README.es.md)

> Full-Stack Educational Platform and Dynamic Developer Portfolio  
> Built with Next.js 16 (App Router), Django 5 (REST Framework), PostgreSQL, Docker, and Google Gemini AI.

---

## Overview

Dadejecova Platform v1.0 is an interactive, full-stack web application designed to combine a technical portfolio with a structured learning management system.

Key capabilities include:
- **Course Curriculum:** Hierarchical structure (Topics, Series, and Lessons) supporting rich Markdown rendering, syntax highlighting, video embeds, and user completion tracking.
- **Dynamic Portfolio (CV):** Database-driven timeline presenting professional experience, education, skills, and personal projects.
- **AI-Assisted Tutoring:** Contextual code explanations and dynamically generated quizzes powered by Google Gemini AI.
- **Role-Based Access Control (RBAC):** Stateless JWT authentication distinguishing public students from staff administrators with a protected CMS dashboard.
- **Unified Monorepo:** Co-locating the backend API and frontend client in a single repository ensures version alignment, simplifies local setup, and enables instant cloud execution via GitHub Codespaces.

---

## Architecture and Repository Structure

```
dadejecova_V01/
├── .devcontainer/              # Cloud development configuration (GitHub Codespaces)
│   └── devcontainer.json
├── portfolio-core-api/         # Backend: Django 5 + Django REST Framework + PostgreSQL
│   ├── ai_tutor/               # Gemini AI service for code explanations and quizzes
│   ├── core/                   # Django configuration, JWT settings, and URL routing
│   ├── cv/                     # Profile, experience, education, and portfolio models
│   ├── projects/               # Educational LMS models, serializers, and views
│   ├── Dockerfile              # Container definition for the web service
│   ├── docker-compose.yml      # Multi-container orchestration (Django, Postgres, Nginx)
│   ├── requirements.txt        # Python dependency specifications
│   ├── README.md               # Backend documentation (English)
│   ├── README.es.md            # Backend documentation (Spanish)
│   └── .env.example            # Backend environment template
├── portfolio-frontend/         # Frontend: Next.js 16 + React 19 + TailwindCSS
│   ├── src/app/                # App Router (pages: /, /topics, /aboutme, /dashboard)
│   ├── src/components/         # Modular UI components and layout wrappers
│   ├── package.json            # Node.js dependencies and scripts
│   ├── README.md               # Frontend documentation (English)
│   ├── README.es.md            # Frontend documentation (Spanish)
│   └── .env.example            # Frontend environment template
├── .gitignore                  # Root rules excluding secrets and build artifacts
├── README.md                   # Main documentation (English)
└── README.es.md                # Main documentation (Spanish)
```

---

## Technology Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router) | React 19 architecture with server and client components |
| **Styling** | TailwindCSS | Responsive design system |
| **Backend Framework** | Django 5.0 + DRF | Python REST API framework with ORM |
| **Database** | PostgreSQL 15 | Relational storage for curriculum, profiles, and progress |
| **Authentication** | SimpleJWT | Stateless JSON Web Tokens with refresh rotation |
| **AI Integration** | Google Gemini AI | Code explanations and automated quiz generation |
| **Containerization** | Docker & Docker Compose | Multi-container environment with Nginx reverse proxy |
| **Cloud Environment** | GitHub Codespaces | One-click browser-based development container |

---

## Quickstart and Setup

You can run this project in three ways: **GitHub Codespaces**, **Docker Compose**, or **Manual Local Setup**.

### Option 1: GitHub Codespaces (1-Click in Browser)

1. Navigate to the main repository page on GitHub.
2. Click the **Code** button, select the **Codespaces** tab, and click **Create codespace on main**.
3. Once the cloud environment finishes loading, execute the following commands in two terminal tabs:

**Terminal 1: Start the Backend API (Django)**
```bash
cd portfolio-core-api
cp .env.example .env
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```
*(Django automatically detects the cloud environment and initializes an instant SQLite database with zero configuration).*

**Terminal 2: Start the Frontend Client (Next.js)**
```bash
cd portfolio-frontend
cp .env.example .env.local
npm install
npm run dev
```

4. Codespaces will detect port `3000` and display an **Open in Browser** popup. Click it to preview the live full-stack application.

---

### Option 2: Docker Compose (Recommended for Local Development)

Prerequisites: Docker Desktop installed and running.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dadejecova/dadejecova_V01.git
   cd dadejecova_V01
   ```

2. **Configure environment variables:**
   ```bash
   # Backend configuration
   cp portfolio-core-api/.env.example portfolio-core-api/.env

   # Frontend configuration
   cp portfolio-frontend/.env.example portfolio-frontend/.env.local
   ```

3. **Start the backend and database containers:**
   ```bash
   cd portfolio-core-api
   docker-compose up --build -d
   ```

4. **Apply database migrations and create an administrator account:**
   ```bash
   docker-compose exec web python manage.py migrate
   docker-compose exec web python manage.py createsuperuser
   ```

5. **Start the frontend application:**
   ```bash
   cd ../portfolio-frontend
   npm install
   npm run dev
   ```

6. **Access the application:**
   - Frontend Application: http://localhost:3000
   - Backend API Root: http://localhost:8000/api/
   - Administration Panel: http://localhost:8000/naxxramas-vault/

---

### Option 3: Manual Local Setup (Without Docker)

<details>
<summary>View manual setup instructions</summary>

#### 1. Backend Setup (Django)
```bash
cd portfolio-core-api
python -m venv venv

# Windows
.\venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your local PostgreSQL connection parameters

python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

#### 2. Frontend Setup (Next.js)
```bash
cd portfolio-frontend
cp .env.example .env.local
npm install
npm run dev
```

</details>

---

## Security and Configuration

- **Zero Credential Exposure:** Secrets, local database credentials, and API keys are strictly excluded from version control via `.gitignore`.
- **Environment Templates:** Developers must create `.env` and `.env.local` from the provided `.env.example` templates before running services.
- **Authentication Lifecycle:** Access tokens have a 7-day lifetime with a 30-day refresh cycle. Administrative operations are validated server-side using the `is_staff` claim.

---

## Author

**Daniel Coello (`dadejecova`)**  
- GitHub: https://github.com/dadejecova  
- Focus: Full-Stack Systems, Software Architecture, and Applied AI

---

## License

This project is licensed under the MIT License.
