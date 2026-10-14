from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
import threading
import os

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # We return success even if the email doesn't exist to prevent "User Enumeration" attacks (security best practice)
            return Response({'success': 'If your email is registered, you will receive a reset link shortly.'}, status=status.HTTP_200_OK)

        # Generate cryptographic token and base64 encoded user ID
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # Dynamic frontend domain (falls back to localhost in dev)
        frontend_url = os.getenv('FRONTEND_URL')
        if not frontend_url:
            frontend_url = os.getenv('DJANGO_CORS_ORIGINS', 'http://localhost:3000').split(',')[0]
        
        # Ensure there is no trailing slash
        frontend_url = frontend_url.rstrip('/')
        reset_link = f"{frontend_url}/reset-password?token={token}&uid={uid}"

        # Send email in a background thread (non-blocking)
        def send_reset_email_async(username, to_email, from_email, link):
            try:
                subject = 'Reset your dadejecova password'
                message = (
                    f'Hi {username},\n\n'
                    f'We received a request to reset your password on dadejecova.com.\n'
                    f'Click the link below to set a new password:\n\n'
                    f'{link}\n\n'
                    f'If you did not make this request, please ignore this email.\n\n'
                    f'Best regards,\n'
                    f'Daniel Coello'
                )
                send_mail(subject, message, from_email, [to_email], fail_silently=True)
            except Exception as e:
                print(f"Error sending reset email in thread: {e}")

        threading.Thread(
            target=send_reset_email_async, 
            args=(user.username, email, settings.DEFAULT_FROM_EMAIL, reset_link)
        ).start()

        return Response({'success': 'If your email is registered, you will receive a reset link shortly.'}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not uidb64 or not token or not new_password:
            return Response({'error': 'UID, Token and New Password are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Decode the user ID
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'error': 'Invalid reset link or expired token'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate the cryptographic token
        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Invalid reset link or expired token'}, status=status.HTTP_400_BAD_REQUEST)

        # Set new password securely
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError
        try:
            validate_password(new_password, user=user)
        except ValidationError as e:
            return Response({'error': ' '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({'success': 'Password has been successfully updated'}, status=status.HTTP_200_OK)
