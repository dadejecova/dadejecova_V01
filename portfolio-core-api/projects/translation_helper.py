import google.generativeai as genai
from django.conf import settings

def translate_to_spanish(text, is_markdown=False):
    if not text or not isinstance(text, str):
        return text
    
    api_key = getattr(settings, 'GEMINI_API_KEY', '')
    if not api_key or api_key == 'your_gemini_api_key_here':
        return text
    
    try:
        genai.configure(api_key=api_key)
        # We try to use the configured model, defaulting to gemini-2.5-flash for general translation task efficiency
        model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-2.5-flash')
        
        if is_markdown:
            system_instruction = (
                "You are an expert technical translator. Translate the following Markdown content to Spanish. "
                "Preserve all Markdown tags, codeblocks, formatting, headers, links, and code content exactly. "
                "Return ONLY the translated Spanish content with no conversational introduction, wrap-ups, or Markdown codeblock fences (like ```markdown ... ```)."
            )
        else:
            system_instruction = (
                "You are an expert translator. Translate the following English text to Spanish. "
                "Return ONLY the translated Spanish text with no conversational introduction or wrapper."
            )
            
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=system_instruction
        )
        response = model.generate_content(text)
        return response.text.strip()
    except Exception as e:
        print(f"Error auto-translating content: {e}")
        return text
