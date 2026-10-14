import google.generativeai as genai
from django.conf import settings
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

# Configure Gemini with the API Key from settings
genai.configure(api_key=settings.GEMINI_API_KEY)

BASE_SYSTEM_PROMPT = """
You are Isa, an educational AI assistant on Daniel Coello's personal portfolio and learning platform.
Your tone is friendly, concise, and helpful. 

CRITICAL RULES:
1. DO NOT make up or hallucinate information about Daniel Coello's CV, life, or the specific architecture of this platform. If asked about his personal details or the specific code of this site, rely ONLY on the provided context below.
2. You are a read-only tutor. You DO NOT have permissions to execute code, delete databases, or modify files.
3. If a user asks you to execute a command or perform any destructive action, politely refuse.
4. Keep your answers EXTREMELY concise. Do not write long essays. Use a conversational, humanistic tone.
5. You can answer general programming, software engineering, and web development questions to help users learn.
6. If the user asks about what they can learn, or what courses/topics/lessons are available, you MUST explicitly recommend the courses listed in the "Educational Series & Lessons Available" section of the KNOWLEDGE BASE below.
"""

def get_dynamic_system_prompt(language='en'):
    """
    Builds the system prompt dynamically by injecting DB context.
    Uses Django caching to avoid hitting the DB on every message.
    """
    cache_key = f"ai_tutor_context_{language}"
    cached_context = cache.get(cache_key)
    
    if cached_context:
        return f"{BASE_SYSTEM_PROMPT}\n\n### KNOWLEDGE BASE (Context for Answering Questions):\n{cached_context}"
    
    # Import inside the function to avoid circular imports during app startup
    from cv.models import Profile, Experience, Education, PersonalProject
    from projects.models import Topic, Series, Lesson
    
    context_parts = []
    
    # 1. Fetch Profile
    profile = Profile.objects.first()
    if profile:
        name = profile.name
        title = profile.title_es if language == 'es' and profile.title_es else profile.title
        bio = profile.bio_es if language == 'es' and profile.bio_es else profile.bio
        context_parts.append(f"## Developer Profile\nName: {name}\nTitle: {title}\nBio: {bio}\nGitHub: {profile.github_url}\nLinkedIn: {profile.linkedin_url}")
        
    # 2. Fetch Experience
    experiences = Experience.objects.all()
    if experiences.exists():
        exp_list = []
        for exp in experiences:
            pos = exp.position_es if language == 'es' and exp.position_es else exp.position
            desc = exp.description_es if language == 'es' and exp.description_es else exp.description
            date_str = f"{exp.start_date} - {'Present' if exp.is_current else exp.end_date}"
            exp_list.append(f"- **{pos}** at {exp.company} ({date_str}): {desc}")
        context_parts.append("## Professional Experience\n" + "\n".join(exp_list))

    # 3. Fetch Education
    educations = Education.objects.all()
    if educations.exists():
        edu_list = []
        for edu in educations:
            deg = edu.degree_es if language == 'es' and edu.degree_es else edu.degree
            date_str = f"{edu.start_date} - {'Present' if edu.is_current else edu.end_date}"
            edu_list.append(f"- **{deg}** at {edu.institution} ({date_str})")
        context_parts.append("## Education\n" + "\n".join(edu_list))

    # 4. Fetch Personal Projects
    projects = PersonalProject.objects.all()
    if projects.exists():
        proj_list = []
        for proj in projects:
            desc = proj.short_description_es if language == 'es' and proj.short_description_es else proj.short_description
            proj_list.append(f"- **{proj.name}**: {desc} (Tech: {proj.technologies})")
        context_parts.append("## Personal Projects\n" + "\n".join(proj_list))

    # 5. Fetch Series & Lessons (Educational Content)
    series = Series.objects.all()
    if series.exists():
        series_list = []
        for s in series:
            s_name = s.name_es if language == 'es' and s.name_es else s.name
            s_desc = s.description_es if language == 'es' and s.description_es else s.description
            lessons = s.lessons.all()
            lesson_count = lessons.count()
            lesson_titles = [l.title_es if language == 'es' and l.title_es else l.title for l in lessons[:5]]
            lesson_str = ", ".join(lesson_titles) + ("..." if lesson_count > 5 else "")
            series_list.append(f"- **Series: {s_name}**: {s_desc}. Lessons ({lesson_count}): {lesson_str}")
        context_parts.append("## Educational Series & Lessons Available\n" + "\n".join(series_list))

    # Combine context
    full_context = "\n\n".join(context_parts)
    
    # Cache the context for 1 hour (3600 seconds)
    cache.set(cache_key, full_context, 3600)
    
    return f"{BASE_SYSTEM_PROMPT}\n\n### KNOWLEDGE BASE (Context for Answering Questions):\n{full_context}"


def generate_tutor_response(user_message, chat_history=None, language='en'):
    """
    Sends a message to the Gemini API using the dynamic system prompt.
    """
    try:
        # Check if API Key is configured
        if not settings.GEMINI_API_KEY:
            logger.error("GEMINI_API_KEY is not set in environment.")
            return "Error: AI Tutor is currently offline due to missing configuration."

        system_instruction = get_dynamic_system_prompt(language)
        model_name = settings.GEMINI_MODEL
        
        try:
            model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=system_instruction
            )
        except Exception as e:
            logger.warning(f"Failed to load primary model {model_name}. Attempting fallback. Error: {e}")
            model_loaded = False
            for fallback_model in settings.GEMINI_FALLBACK_MODELS:
                try:
                    model = genai.GenerativeModel(
                        model_name=fallback_model,
                        system_instruction=system_instruction
                    )
                    model_loaded = True
                    break
                except Exception:
                    continue
            
            if not model_loaded:
                return "Error: Unable to connect to any AI models at this time."

        # Start a chat session or send a single message
        if chat_history and isinstance(chat_history, list):
            chat = model.start_chat(history=chat_history)
            response = chat.send_message(user_message)
        else:
            response = model.generate_content(user_message)

        return response.text

    except Exception as e:
        logger.error(f"Error generating Gemini response: {str(e)}")
        return "I'm sorry, I encountered an internal error while trying to process your request."
