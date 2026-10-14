from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from cv.api import ExperienceViewSet
from projects.api import LessonViewSet, SeriesViewSet, TopicViewSet, LessonTypeViewSet, LessonCompletionViewSet, RegisterView, CustomTokenObtainPairView, UserViewSet, LessonQuizView, ExplainCodeView, UserProfileView, AnalyticsStatisticsView
from projects.password_reset import PasswordResetRequestView, PasswordResetConfirmView
from django.conf import settings
from django.conf.urls.static import static

# SimpleJWT
from rest_framework_simplejwt.views import TokenRefreshView

from cv.api import ExperienceViewSet, ProfileViewSet, EducationViewSet, PersonalProjectViewSet

router = routers.DefaultRouter()
router.register('profile', ProfileViewSet, 'profile')
router.register('experiences', ExperienceViewSet, 'experiences')
router.register('education', EducationViewSet, 'education')
router.register('personal-projects', PersonalProjectViewSet, 'personal-projects')
# Rutas lab
router.register('topics', TopicViewSet, 'topics')
router.register('series', SeriesViewSet, 'series')
router.register('lessons', LessonViewSet, 'lessons')
router.register('lesson-types', LessonTypeViewSet, 'lesson-types')
router.register('progress', LessonCompletionViewSet, 'progress')
router.register('users', UserViewSet, 'users')

urlpatterns = [
    path('naxxramas-vault/', admin.site.urls),
    path('api/', include(router.urls)), #incluye las rutas del api

    # endpoints para jwt
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    # Ruta para pedir token sin loguearte nuevamente
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Endpoint para perfil de usuario
    path('api/user/profile/', UserProfileView.as_view(), name='user-profile'),
    
    # Endpoint para generar quiz con IA
    path('api/lessons/<slug:slug>/quiz/', LessonQuizView.as_view(), name='lesson-quiz'),
    
    # Endpoint para explicar código con IA
    path('api/ai/explain-code/', ExplainCodeView.as_view(), name='explain-code'),

    # Analytics Endpoint
    path('api/analytics/statistics/', AnalyticsStatisticsView.as_view(), name='analytics-statistics'),

    # Password Reset API endpoints
    path('api/password-reset/request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('api/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),

    # AI Tutor Endpoint
    path('api/ai_tutor/', include('ai_tutor.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)