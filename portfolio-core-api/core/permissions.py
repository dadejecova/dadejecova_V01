from rest_framework import permissions

class IsAdminUserOrReadOnly(permissions.BasePermission):
    """
    Permite acceso de solo lectura a cualquier usuario.
    Permite crear, editar o eliminar solo a administradores (is_staff).
    """
    def has_permission(self, request, view):
        # Solicitudes GET, HEAD, o OPTIONS son siempre permitidas.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Para métodos inseguros (POST, PUT, DELETE), el usuario debe ser admin
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)
