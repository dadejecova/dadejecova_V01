from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .services import generate_tutor_response

class ChatView(APIView):
    # Require authentication to prevent abuse
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_message = request.data.get('message')
        chat_history = request.data.get('history', [])
        language = request.data.get('language', 'en')

        if not user_message:
            return Response(
                {"error": "The 'message' field is required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Ensure history is in the correct format for Gemini if provided
        # Gemini expects: [{'role': 'user'|'model', 'parts': ['text']}]
        # But we will accept a simpler format from the frontend and map it if necessary.
        # For simplicity, we just pass it along if it exists.
        
        response_text = generate_tutor_response(user_message, chat_history, language=language)
        
        return Response({
            "response": response_text
        }, status=status.HTTP_200_OK)
