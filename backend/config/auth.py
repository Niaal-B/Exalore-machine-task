from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class AdminTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Issue platform tokens only to active Django staff users."""

    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_active or not self.user.is_staff:
            raise AuthenticationFailed("Administrator access is required.")
        data["username"] = self.user.get_username()
        return data


class AdminTokenObtainPairView(TokenObtainPairView):
    serializer_class = AdminTokenObtainPairSerializer
