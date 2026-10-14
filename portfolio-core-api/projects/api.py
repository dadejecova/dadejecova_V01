from rest_framework import viewsets, permissions, filters
from .models import Lesson, Topic, Series, LessonType, CodeExplanationCache, StudentProfile
from .serializers import LessonSerializer, TopicSerializer, SeriesSerializer, LessonTypeSerializer
from core.permissions import IsAdminUserOrReadOnly

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    lookup_field = 'slug'

    # busqueda drf
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'topic__name', 'series__name']
    
    def get_queryset(self):
        queryset = super().get_queryset()

        series_slug = self.request.query_params.get('series', None)

        if series_slug is not None:
            queryset = queryset.filter(series__slug=series_slug)
        
        return queryset

class LessonTypeViewSet(viewsets.ModelViewSet):
    queryset= LessonType.objects.all()
    permission_classes = [IsAdminUserOrReadOnly]
    serializer_class = LessonTypeSerializer
    lookup_field = 'slug'

class TopicViewSet(viewsets.ModelViewSet):
    queryset= Topic.objects.all()
    permission_classes = [IsAdminUserOrReadOnly]
    serializer_class = TopicSerializer
    lookup_field = 'slug'

class SeriesViewSet(viewsets.ModelViewSet):
    serializer_class = SeriesSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    lookup_field = 'slug'

    def get_queryset(self):
        queryset= Series.objects.all()

        topic_slug = self.request.query_params.get('topic', None)
        if topic_slug:
            queryset = queryset.filter(topic__slug=topic_slug)

        my_courses = self.request.query_params.get('my_courses', None)
        if my_courses == 'true' and self.request.user.is_authenticated:
            completed_lesson_series_ids = LessonCompletion.objects.filter(
                user=self.request.user
            ).values_list('lesson__series_id', flat=True).distinct()
            queryset = queryset.filter(id__in=completed_lesson_series_ids)

        return queryset

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if not username or not email or not password:
            return Response({'error': 'Todos los campos son obligatorios'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(username=username).exists():
            return Response({'error': 'El nombre de usuario ya está en uso'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'El correo electrónico ya está registrado'}, status=status.HTTP_400_BAD_REQUEST)

        user_temp = User(username=username, email=email)
        try:
            validate_password(password, user=user_temp)
        except ValidationError as e:
            return Response({'error': ' '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, email=email, password=password)
        
        # Enviar correo de bienvenida en un hilo de fondo (Asynchronous Welcome Email)
        import threading
        from django.core.mail import send_mail
        from django.conf import settings

        def send_welcome_email_async(username, email, from_email):
            try:
                subject = 'Welcome to dadejecova!'
                message = (
                    f'Hi {username},\n\n'
                    f'Thank you for registering at dadejecova.com!\n'
                    f'We are excited to have you on board. You can now track your learning progress across all tutorials.\n\n'
                    f'Best regards,\n'
                    f'Daniel Coello'
                )
                send_mail(subject, message, from_email, [email], fail_silently=True)
            except Exception as e:
                print(f"Error sending welcome email in thread: {e}")

        # Iniciamos el envío de correo en segundo plano
        threading.Thread(
            target=send_welcome_email_async, 
            args=(username, email, settings.DEFAULT_FROM_EMAIL)
        ).start()

        return Response({'success': 'Usuario creado exitosamente'}, status=status.HTTP_201_CREATED)

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Añadimos is_staff al payload del token
        token['is_staff'] = user.is_staff
        return token

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

from .models import LessonCompletion
from .serializers import LessonCompletionSerializer

class LessonCompletionViewSet(viewsets.ModelViewSet):
    serializer_class = LessonCompletionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Un usuario solo puede ver y modificar su propio progreso
        return LessonCompletion.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


from django.contrib.auth.models import User
from .serializers import UserSerializer

from rest_framework.exceptions import PermissionDenied

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def perform_destroy(self, instance):
        if instance.is_staff or instance.is_superuser:
            raise PermissionDenied("Cannot delete administrative users.")
        if instance == self.request.user:
            raise PermissionDenied("Cannot delete your own account.")
        instance.delete()

    def perform_update(self, serializer):
        instance = self.get_object()
        # Prevent deactivating admin users or self
        is_active = serializer.validated_data.get('is_active')
        if is_active is False:
            if instance.is_staff or instance.is_superuser:
                raise PermissionDenied("Cannot deactivate administrative users.")
            if instance == self.request.user:
                raise PermissionDenied("Cannot deactivate your own account.")
        serializer.save()


import google.generativeai as genai
from django.conf import settings
import json

class LessonQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        try:
            # 1. Fetch the lesson
            try:
                lesson = Lesson.objects.get(slug=slug)
            except Lesson.DoesNotExist:
                return Response({"error": "Lesson not found."}, status=status.HTTP_404_NOT_FOUND)

            # Determine language (using header 'Accept-Language' or query param 'lang')
            lang = request.headers.get('Accept-Language', 'en').lower()
            if not lang or lang == 'undefined':
                lang = request.query_params.get('lang', 'en').lower()
            lang = lang[:2] if lang else 'en'

            title = lesson.title_es if lang == 'es' and lesson.title_es else lesson.title
            content = lesson.content_es if lang == 'es' and lesson.content_es else lesson.content

            # Check cache
            if lesson.ai_quiz_cache:
                if isinstance(lesson.ai_quiz_cache, dict) and "questions" in lesson.ai_quiz_cache:
                    if lang == 'en':
                        return Response(lesson.ai_quiz_cache, status=status.HTTP_200_OK)
                elif isinstance(lesson.ai_quiz_cache, dict) and lang in lesson.ai_quiz_cache:
                    return Response(lesson.ai_quiz_cache[lang], status=status.HTTP_200_OK)

            # 2. Check if API key is configured
            api_key = getattr(settings, 'GEMINI_API_KEY', '')
            if not api_key or api_key == 'your_gemini_api_key_here':
                # Return static mockup quiz for development/demo if key is not configured
                if lang == 'es':
                    mock_quiz = {
                        "questions": [
                            {
                                "id": 1,
                                "question": f"¿Cuál es el tema principal de la lección: '{title}'?",
                                "options": [
                                    "Desarrollo frontend básico",
                                    "Configuración y desarrollo relacionado con el tema de la lección",
                                    "Administración de sistemas heredados",
                                    "Diseño gráfico digital"
                                ],
                                "correct_index": 1,
                                "explanation": "El enfoque de la lección es el desarrollo y configuración descritos en su contenido."
                            },
                            {
                                "id": 2,
                                "question": "¿Cuál es uno de los requisitos para el tema presentado?",
                                "options": [
                                    "Ninguno de los anteriores",
                                    "Configuración manual sin automatización",
                                    "Tener el entorno adecuado instalado y seguir los pasos descritos",
                                    "Conocimiento avanzado de compiladores de C++"
                                ],
                                "correct_index": 2,
                                "explanation": "Seguir los pasos y tener el entorno adecuado es fundamental para completar la lección."
                            },
                            {
                                "id": 3,
                                "question": "¿Por qué es importante esta lección en el proyecto?",
                                "options": [
                                    "Para agregar líneas de código",
                                    "Para aprender y dominar la tecnología a través de experiencia práctica",
                                    "No es una lección importante",
                                    "Para aprender cómo desplegar aplicaciones en AWS"
                                ],
                                "correct_index": 1,
                                "explanation": "Cada lección está diseñada para ofrecer experiencia práctica y dominar la tecnología correspondiente."
                            }
                        ]
                    }
                else:
                    mock_quiz = {
                        "questions": [
                            {
                                "id": 1,
                                "question": f"What is the primary topic of the lesson: '{title}'?",
                                "options": [
                                    "Basic frontend development",
                                    "Configuration and development related to the lesson topic",
                                    "Legacy systems administration",
                                    "Digital graphic design"
                                ],
                                "correct_index": 1,
                                "explanation": "The lesson focus is on configuration and development related to its title and content."
                            },
                            {
                                "id": 2,
                                "question": "What is one of the requirements for the topic presented?",
                                "options": [
                                    "None of the above",
                                    "Manual configuration without automation",
                                    "Having the appropriate environment installed and following the described steps",
                                    "Advanced knowledge of C++ compilers"
                                ],
                                "correct_index": 2,
                                "explanation": "Following the steps and having the appropriate environment set up are essential to completing the lesson."
                            },
                            {
                                "id": 3,
                                "question": "Why is this lesson important in the project?",
                                "options": [
                                    "To add lines of code",
                                    "To learn and master the technology through practical experience",
                                    "It is not an important lesson",
                                    "To learn how to deploy applications on AWS"
                                ],
                                "correct_index": 1,
                                "explanation": "Each lesson is designed to provide hands-on experience and master the technology in question."
                            }
                        ]
                    }
                return Response(mock_quiz, status=status.HTTP_200_OK)

            # 3. Configure Gemini SDK
            genai.configure(api_key=api_key)
            
            # 4. Define target output schema
            schema = {
                "type": "OBJECT",
                "properties": {
                    "questions": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "id": {"type": "INTEGER"},
                                "question": {"type": "STRING"},
                                "options": {
                                    "type": "ARRAY",
                                    "items": {"type": "STRING"}
                                },
                                "correct_index": {"type": "INTEGER"},
                                "explanation": {"type": "STRING"}
                            },
                            "required": ["id", "question", "options", "correct_index", "explanation"]
                        }
                    }
                },
                "required": ["questions"]
            }

            # 5. Formulate prompt
            prompt = (
                f"Clase: {title}\n"
                f"Tecnología: {lesson.technology or 'General'}\n"
                f"Contenido:\n{content}"
            )

            # 6. Generate content with fallback cascade of models
            model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-3.5-flash')
            fallback_models = getattr(settings, 'GEMINI_FALLBACK_MODELS', ['gemini-3.5-flash', 'gemini-3-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash-lite', 'gemini-2.5-flash'])
            models_to_try = [model_name]
            for m in fallback_models:
                if m not in models_to_try:
                    models_to_try.append(m)

            system_instruction_en = (
                "You are an expert technical tutor. Generate a 3-question multiple-choice quiz "
                "in English based strictly on the lesson content provided. Each question "
                "must have exactly 4 options. Include the 0-based index of the correct option "
                "and a short, helpful explanation in English explaining why it is correct. "
                "Respond strictly following the requested JSON structure."
            )
            system_instruction_es = (
                "Eres un tutor técnico experto. Genera un cuestionario de opción múltiple de 3 preguntas "
                "en Español basado estrictamente en el contenido de la lección proporcionada. Cada pregunta "
                "debe tener exactamente 4 opciones. Incluye el índice basado en 0 de la opción correcta "
                "y una explicación breve y útil en Español que explique por qué es correcta. "
                "Responde siguiendo estrictamente la estructura JSON solicitada."
            )
            sys_inst = system_instruction_es if lang == 'es' else system_instruction_en

            response_text = None
            last_exception = None
            for current_model in models_to_try:
                try:
                    model = genai.GenerativeModel(
                        model_name=current_model,
                        generation_config={
                            "response_mime_type": "application/json",
                            "response_schema": schema
                        },
                        system_instruction=sys_inst
                    )
                    response = model.generate_content(prompt)
                    response_text = response.text
                    break
                except Exception as e:
                    last_exception = e
                    err_msg = str(e)
                    if "429" in err_msg or "quota" in err_msg.lower() or "limit" in err_msg.lower():
                        continue  # Try the next model
                    raise e  # Propagate other errors

            if not response_text:
                if last_exception:
                    raise last_exception
                raise Exception("No response generated.")

            quiz_data = json.loads(response_text)

            # Save to cache
            if not isinstance(lesson.ai_quiz_cache, dict) or "questions" in lesson.ai_quiz_cache:
                old_cache = lesson.ai_quiz_cache
                lesson.ai_quiz_cache = {}
                if old_cache and "questions" in old_cache:
                    lesson.ai_quiz_cache['en'] = old_cache

            lesson.ai_quiz_cache[lang] = quiz_data
            lesson.save()

            return Response(quiz_data, status=status.HTTP_200_OK)

        except Exception as e:
            error_message = str(e)
            if "429" in error_message or "quota" in error_message.lower() or "limit" in error_message.lower():
                return Response(
                    {"error": "We're a bit busy at the moment, please come back later :("}, 
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            return Response({"error": f"Error generating quiz with AI: {error_message}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ExplainCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            code = request.data.get('code', '')
            language = request.data.get('language', 'python')

            if not code:
                return Response({"error": "Code block cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

            # Determine language (using header 'Accept-Language' or query param 'lang')
            lang = request.headers.get('Accept-Language', 'en').lower()
            if not lang or lang == 'undefined':
                lang = request.query_params.get('lang', 'en').lower()
            lang = lang[:2] if lang else 'en'

            # Normalize the code to ensure consistent hashing across platform line endings (\r\n vs \n) and spacing
            normalized_code = code.replace('\r\n', '\n').replace('\r', '\n').strip()

            # Check cache with localized hash
            import hashlib
            code_hash = hashlib.sha256(f"{normalized_code}_{lang}".encode('utf-8')).hexdigest()
            cache_entry = CodeExplanationCache.objects.filter(code_hash=code_hash).first()
            if cache_entry:
                return Response(cache_entry.explanation_json, status=status.HTTP_200_OK)

            # 1. Check if API key is configured
            api_key = getattr(settings, 'GEMINI_API_KEY', '')
            if not api_key or api_key == 'your_gemini_api_key_here':
                # Return static mockup explanations for testing
                if lang == 'es':
                    mock_explanation = {
                        "explanation": [
                            {
                                "lines": "def parse_data(response):",
                                "meaning": "Define una función llamada parse_data que acepta un parámetro response de la API."
                            },
                            {
                                "lines": "data = response.json()",
                                "meaning": "Parsea el cuerpo de la respuesta HTTP directamente a un diccionario de Python usando el método .json()."
                            },
                            {
                                "lines": "return data['results']",
                                "meaning": "Extrae el campo 'results' del diccionario parseado y lo devuelve al llamador."
                            }
                        ],
                        "data_flow": [
                            "El objeto de respuesta HTTP sin procesar es recibido por la función.",
                            "El analizador JSON convierte los bytes en un diccionario estructurado.",
                            "El paso de filtrado extrae datos específicos bajo la clave 'results'.",
                            "La lista filtrada se devuelve para su inserción en la base de datos o renderizado."
                        ]
                    }
                else:
                    mock_explanation = {
                        "explanation": [
                            {
                                "lines": "def parse_data(response):",
                                "meaning": "Defines a function named parse_data that accepts an API response parameter."
                            },
                            {
                                "lines": "data = response.json()",
                                "meaning": "Parses the raw HTTP response body directly into a python dictionary using the .json() method."
                            },
                            {
                                "lines": "return data['results']",
                                "meaning": "Extracts the 'results' field from the parsed dictionary and returns it back to the caller."
                            }
                        ],
                        "data_flow": [
                            "Raw HTTP response object is received by the function.",
                            "JSON parser converts bytes into a Structured Dictionary.",
                            "Filter step extracts specific target data under the 'results' key.",
                            "Filtered list is returned for database insertion or rendering."
                        ]
                    }
                return Response(mock_explanation, status=status.HTTP_200_OK)

            # 2. Configure Gemini SDK
            genai.configure(api_key=api_key)

            # 3. Define target output schema
            schema = {
                "type": "OBJECT",
                "properties": {
                    "explanation": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "lines": {"type": "STRING"},
                                "meaning": {"type": "STRING"}
                            },
                            "required": ["lines", "meaning"]
                        }
                    },
                    "data_flow": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"}
                    }
                },
                "required": ["explanation", "data_flow"]
            }

            # 4. Formulate prompt
            prompt = f"Explain the following {language} code:\n\n{normalized_code}"

            # 5. Generate content with fallback cascade of models
            model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-3.5-flash')
            fallback_models = getattr(settings, 'GEMINI_FALLBACK_MODELS', ['gemini-3.5-flash', 'gemini-3-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash-lite', 'gemini-2.5-flash'])
            models_to_try = [model_name]
            for m in fallback_models:
                if m not in models_to_try:
                    models_to_try.append(m)

            system_instruction_en = (
                "You are an expert technical teacher explaining code to a student. "
                "Analyze the provided code block and generate a list representing a line-by-line or section-by-section "
                "simplified breakdown, where 'lines' holds the line/snippet of code, and 'meaning' holds the plain-English explanation. "
                "Also, generate a step-by-step list of strings in 'data_flow' representing the logical order of execution "
                "or the sequence of how data transitions and variables change through the code. "
                "Respond strictly following the requested JSON structure in English."
            )
            system_instruction_es = (
                "Eres un profesor técnico experto que explica código a un estudiante. "
                "Analiza el bloque de código proporcionado y genera una lista que represente un desglose simplificado "
                "línea por línea o sección por sección, donde 'lines' contiene la línea/fragmento de código, y 'meaning' contiene la explicación en Español simple. "
                "Además, genera una lista paso a paso de cadenas en 'data_flow' que represente el orden lógico de ejecución "
                "o la secuencia de cómo cambian las variables y transiciones de datos a través del código. "
                "Responde siguiendo estrictamente la estructura JSON solicitada en Español."
            )
            sys_inst = system_instruction_es if lang == 'es' else system_instruction_en

            response_text = None
            last_exception = None
            for current_model in models_to_try:
                try:
                    model = genai.GenerativeModel(
                        model_name=current_model,
                        generation_config={
                            "response_mime_type": "application/json",
                            "response_schema": schema
                        },
                        system_instruction=sys_inst
                    )
                    response = model.generate_content(prompt)
                    response_text = response.text
                    break
                except Exception as e:
                    last_exception = e
                    err_msg = str(e)
                    if "429" in err_msg or "quota" in err_msg.lower() or "limit" in err_msg.lower():
                        continue  # Try the next model
                    raise e  # Propagate other errors

            if not response_text:
                if last_exception:
                    raise last_exception
                raise Exception("No response generated.")

            data = json.loads(response_text)

            # Save to cache
            CodeExplanationCache.objects.create(
                code_hash=code_hash,
                code_text=normalized_code,
                language=language,
                explanation_json=data
            )

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            error_message = str(e)
            if "429" in error_message or "quota" in error_message.lower() or "limit" in error_message.lower():
                return Response(
                    {"error": "We're a bit busy at the moment, please come back later :("}, 
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            return Response({"error": f"Error explaining code with AI: {error_message}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile, created = StudentProfile.objects.get_or_create(user=user)
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "date_joined": user.date_joined,
            "country": profile.country,
            "city": profile.city,
            "tier": profile.tier,
            "preferred_track": profile.preferred_track,
            "github_username": profile.github_username,
        })

    def patch(self, request):
        user = request.user
        profile, created = StudentProfile.objects.get_or_create(user=user)

        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        
        country = request.data.get("country")
        city = request.data.get("city")
        preferred_track = request.data.get("preferred_track")
        github_username = request.data.get("github_username")

        # 1. Update password
        if new_password:
            if not current_password:
                return Response({"error": "Current password is required to change password."}, status=status.HTTP_400_BAD_REQUEST)
            if not user.check_password(current_password):
                return Response({"error": "Incorrect current password."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                validate_password(new_password, user=user)
            except ValidationError as e:
                return Response({"error": " ".join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)

        user.save()

        # 3. Update profile fields
        if country is not None:
            profile.country = country
        if city is not None:
            profile.city = city
        if preferred_track is not None:
            valid_tracks = [t[0] for t in StudentProfile.TRACK_CHOICES]
            if preferred_track and preferred_track not in valid_tracks:
                return Response({"error": f"Invalid preferred track. Choose from {valid_tracks}"}, status=status.HTTP_400_BAD_REQUEST)
            profile.preferred_track = preferred_track
        if github_username is not None:
            profile.github_username = github_username
            
        profile.save()

        return Response({
            "success": "Account updated successfully.",
            "username": user.username,
            "email": user.email,
            "country": profile.country,
            "city": profile.city,
            "tier": profile.tier,
            "preferred_track": profile.preferred_track,
            "github_username": profile.github_username,
        })


from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from collections import defaultdict

class AnalyticsStatisticsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # 1. Tier counts
        tier_counts = StudentProfile.objects.values('tier').annotate(count=Count('tier'))
        tiers = {item['tier']: item['count'] for item in tier_counts}

        # 2. Country counts
        country_counts = StudentProfile.objects.exclude(country__isnull=True).exclude(country='').values('country').annotate(count=Count('country')).order_by('-count')
        countries = {item['country']: item['count'] for item in country_counts}

        # 3. Preferred track counts
        track_counts = StudentProfile.objects.exclude(preferred_track__isnull=True).exclude(preferred_track='').values('preferred_track').annotate(count=Count('preferred_track'))
        tracks = {item['preferred_track']: item['count'] for item in track_counts}

        # 4. Monthly registrations (last 12 months)
        one_year_ago = timezone.now() - timedelta(days=365)
        users = User.objects.filter(date_joined__gte=one_year_ago).values_list('date_joined', flat=True)
        
        registrations_dict = defaultdict(int)
        for dj in users:
            month_str = dj.strftime('%Y-%m')  # e.g., "2026-05"
            registrations_dict[month_str] += 1
            
        registrations = [{"month": k, "count": v} for k, v in sorted(registrations_dict.items())]

        return Response({
            "countries": countries,
            "tracks": tracks,
            "tiers": tiers,
            "registrations": registrations
        }, status=status.HTTP_200_OK)


