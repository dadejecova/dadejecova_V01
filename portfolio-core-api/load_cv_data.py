import os
import django
import urllib.request

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from cv.models import Profile, Experience, Education, PersonalProject

def download_assets():
    print("Downloading media assets...")
    
    # Download avatar
    avatar_dir = 'media/cv/avatar'
    os.makedirs(avatar_dir, exist_ok=True)
    avatar_path = os.path.join(avatar_dir, 'DanielPerfilHTC_Q3TYhiT.jpg')
    if not os.path.exists(avatar_path):
        try:
            print("Downloading avatar image from production...")
            urllib.request.urlretrieve('http://api.dadejecova.com/media/cv/avatar/DanielPerfilHTC_Q3TYhiT.jpg', avatar_path)
            print("Avatar downloaded successfully.")
        except Exception as e:
            print(f"Warning: Could not download avatar: {e}")

    # Download project image
    project_dir = 'media/cv/projects'
    os.makedirs(project_dir, exist_ok=True)
    project_img_path = os.path.join(project_dir, 'Captura_de_pantalla_2026-05-18_215732.png')
    if not os.path.exists(project_img_path):
        try:
            print("Downloading project image from production...")
            urllib.request.urlretrieve('http://api.dadejecova.com/media/cv/projects/Captura_de_pantalla_2026-05-18_215732.png', project_img_path)
            print("Project image downloaded successfully.")
        except Exception as e:
            print(f"Warning: Could not download project image: {e}")

def load_data():
    print("Clearing existing CV data...")
    Profile.objects.all().delete()
    Experience.objects.all().delete()
    Education.objects.all().delete()
    PersonalProject.objects.all().delete()

    print("Inserting Profile data...")
    # Profile
    Profile.objects.create(
        id=1,
        name="Daniel Coello",
        title="Software Engineer • Data & Full-Stack Systems",
        title_es="Ingeniero de Software • Sistemas de Datos y Full-Stack",
        bio="Passionate about technology, software development, and creating efficient solutions. I love learning and sharing knowledge.",
        bio_es="Apasionado por la tecnología, el desarrollo de software y la creación de soluciones eficientes. Me encanta aprender y compartir conocimientos.",
        avatar="cv/avatar/DanielPerfilHTC_Q3TYhiT.jpg", # Local relative path
        cv_file=None,
        github_url="https://github.com/dadejecova",
        linkedin_url="https://www.linkedin.com/in/danielcoellovargas/",
        email="contact@example.com"
    )

    print("Inserting Experience data...")
    # Experiences
    experiences = [
        {
            "id": 5,
            "company": "Interagua Ecuador",
            "position": "Technical Analyst",
            "position_es": "Analista Técnico",
            "description": "Developed and maintained analytical dashboards for the PMO department, enabling strategic data-driven decision-making based on key KPIs. Designed and deployed custom AppSheet applications for field operations, integrating geolocalized tracking and automated report generation. Managed database operations, optimized SQL queries, and modeled datasets for seamless visualization.",
            "description_es": "Desarrollé y mantuve paneles de control analíticos para el departamento de PMO, lo que permitió la toma de decisiones estratégicas basadas en KPIs clave. Diseñé e implementé aplicaciones personalizadas en AppSheet para operaciones de campo, integrando seguimiento geolocalizado y generación automática de informes. Administré operaciones de base de datos, optimicé consultas SQL y modelé conjuntos de datos para una visualización fluida.",
            "start_date": "2024-04-04",
            "end_date": None,
            "is_current": True
        },
        {
            "id": 4,
            "company": "Escuela artesanal de Belleza y Cosmetología",
            "position": "Internal Systems & Data Analyst",
            "position_es": "Analista de Sistemas Internos y Datos",
            "description": "Led the digital transformation of the institution by architecting and developing a custom Django-based ERP system to streamline student enrollment, billing workflows, and inventory tracking. Created interactive business intelligence dashboards to monitor financial KPIs, student retention rates, and enrollment trends. Automated administrative pipelines and data ingestion processes using Google Workspace APIs. Optimized digital marketing campaigns (Meta & TikTok Ads) based on data performance analysis (ROAS, CTR).",
            "description_es": "Lideré la transformación digital de la institución mediante la arquitectura y desarrollo de un sistema ERP personalizado basado en Django para optimizar el registro de estudiantes, los flujos de facturación y el seguimiento del inventario. Creé paneles interactivos de inteligencia de negocios para monitorear KPIs financieros, tasas de retención de estudiantes y tendencias de inscripción. Automaticé flujos de trabajo administrativos y procesos de ingesta de datos utilizando las APIs de Google Workspace. Optimicé campañas de marketing digital (Meta y TikTok Ads) basadas en análisis de rendimiento de datos (ROAS, CTR).",
            "start_date": "2019-11-01",
            "end_date": "2024-04-03",
            "is_current": False
        },
        {
            "id": 3,
            "company": "XPATIAL",
            "position": "Project Manager & Backend Developer",
            "position_es": "Gerente de Proyectos y Desarrollador Backend",
            "description": "Developed backend logic and REST APIs to enable real-time data integration for virtual and augmented reality applications. Managed the end-to-end delivery of immersive B2B projects, leading team sprints from initial concept through deployment for international clients. Built interactive mobile AR applications and immersive 360° virtual tours using high-fidelity rendering engines.",
            "description_es": "Desarrollé lógica backend y APIs REST para permitir la integración de datos en tiempo real en aplicaciones de realidad virtual y aumentada. Gestioné la entrega de proyectos inmersivos B2B, liderando sprints de equipo desde el concepto inicial hasta el despliegue para clientes internacionales. Construí aplicaciones móviles de RA interactivas y recorridos virtuales inmersivos de 360° utilizando motores de renderizado de alta fidelidad.",
            "start_date": "2016-02-01",
            "end_date": "2019-10-31",
            "is_current": False
        },
        {
            "id": 2,
            "company": "DataMarketing",
            "position": "Database Administrator",
            "position_es": "Administrador de Bases de Datos",
            "description": "Designed and implemented robust ETL data pipelines in MySQL and automated scheduled reports to analyze human resources metrics and operational performance.",
            "description_es": "Diseñé e implementé procesos ETL robustos en MySQL y automaticé reportes programados para analizar métricas de recursos humanos y rendimiento operativo.",
            "start_date": "2015-10-05",
            "end_date": "2016-01-29",
            "is_current": False
        },
        {
            "id": 1,
            "company": "Ministerio de Salud Pública",
            "position": "IT Support Technician",
            "position_es": "Técnico de Soporte de TI",
            "description": "Performed preventive and corrective maintenance of hardware infrastructure and managed the tracking and inventory of assets.",
            "description_es": "Realicé mantenimiento preventivo y correctivo de la infraestructura de hardware de la empresa y gestioné el control e inventario de activos tecnológicos.",
            "start_date": "2012-06-04",
            "end_date": "2012-10-31",
            "is_current": False
        }
    ]
    for exp in experiences:
        Experience.objects.create(**exp)

    print("Inserting Education data...")
    # Education
    education_records = [
        {
            "id": 3,
            "institution": "UNIR - La Universidad en Internet",
            "degree": "Visual Analytics and Big Data",
            "degree_es": "Analítica Visual y Big Data",
            "start_date": "2019-11-04",
            "end_date": "2021-10-29",
            "is_current": False,
            "description": "Comprehensive study of data mining, large-scale data modeling, visual analytics, and business intelligence reporting systems.",
            "description_es": "Estudio integral de minería de datos, modelado de datos a gran escala, analítica visual y sistemas de reporte de inteligencia de negocios."
        },
        {
            "id": 2,
            "institution": "Universidad de Guayaquil",
            "degree": "B.S. in Computer Systems Engineering",
            "degree_es": "Licenciatura en Ingeniería de Sistemas Computacionales",
            "start_date": "2011-02-14",
            "end_date": "2017-11-10",
            "is_current": False,
            "description": "Focused on software engineering methodologies, web and mobile application development, database systems administration, and server management.",
            "description_es": "Centrado en metodologías de ingeniería de software, desarrollo de aplicaciones web y móviles, administración de sistemas de bases de datos y gestión de servidores."
        }
    ]
    for edu in education_records:
        Education.objects.create(**edu)

    print("Inserting PersonalProject data...")
    # Personal Projects
    projects = [
        {
            "id": 3,
            "name": "dadejecova.com — E-Learning & Portfolio Engine",
            "short_description": "Full-stack responsive educational platform and portfolio system with student progress tracking.",
            "short_description_es": "Plataforma educativa interactiva y portafolio responsive con seguimiento de progreso de estudiantes.",
            "description": "Designed and engineered a custom, secure e-learning platform and portfolio engine. Architected a decoupled client-server model using Next.js for high-performance static rendering and Django REST Framework to manage data relationships dynamically. Implemented token-based JWT authentication, a responsive administrative CRUD dashboard for content publishing, and interactive student progress tracking.",
            "description_es": "Diseñé y programé una plataforma de aprendizaje en línea y motor de portafolio personalizado. Arquitecturé un modelo cliente-servidor desacoplado usando Next.js para un renderizado estático de alto rendimiento y Django REST Framework para gestionar relaciones de datos de forma dinámica. Implementé autenticación JWT basada en tokens, un panel administrativo CRUD interactivo para la publicación de contenidos y el seguimiento de progreso de los estudiantes.",
            "image": "cv/projects/Captura_de_pantalla_2026-05-18_215732.png", # Local relative path
            "repository_url": "",
            "demo_url": "https://www.dadejecova.com",
            "technologies": "React, Next.js 16, Django, Django REST Framework, PostgreSQL, Docker, Tailwind CSS",
            "order": 0
        },
        {
            "id": 2,
            "name": "Interactive Pokémon Data Explorer",
            "short_description": "A containerized analytical dashboard backed by a high-performance REST API.",
            "short_description_es": "Un panel de análisis interactivo en contenedores respaldado por una API REST de alto rendimiento.",
            "description": "Developed an interactive data visualization platform leveraging a high-performance FastAPI backend and a responsive React frontend. Containerized the entire stack using Docker to ensure seamless local development and production deployments.",
            "description_es": "Desarrollé una plataforma interactiva de visualización de datos utilizando un backend FastAPI de alto rendimiento y un frontend React adaptivo. Contenedoricé todo el stack usando Docker para garantizar un desarrollo local y despliegue en producción fluidos.",
            "image": None,
            "repository_url": "https://github.com/dadejecova/poke-analytics-fastapi",
            "demo_url": "",
            "technologies": "FastAPI, Streamlit, Docker, Python, Pandas",
            "order": 1
        }
    ]
    for proj in projects:
        PersonalProject.objects.create(**proj)

    print("All CV data loaded successfully!")

if __name__ == "__main__":
    download_assets()
    load_data()
