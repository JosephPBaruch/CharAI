from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer, FieldDataSerializer

#api calls & endpoints
class RegisterView(APIView):
    """API endpoint for user registration"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            login(request, user)  # Also create session
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': 'User registered successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """API endpoint for user login"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({
                'error': 'Username and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    """API endpoint for user logout"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            # Delete the user's token
            request.user.auth_token.delete()
        except Exception:
            pass
        logout(request)
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)


class UserInfoView(APIView):
    """API endpoint to get current user information"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class FieldDataView(APIView):
    """API endpoint for processing prescription map field data"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Accept field data with GeoJSON features and field metadata
        
        Expected format:
        {
            "globalMax": "",
            "field": {
                "id": "main-field",
                "cropType": "Wheat",
                "customCrop": "",
                "price": 23,
                "unit": "bushel"
            },
            "data": {
                "type": "FeatureCollection",
                "features": [...]
            }
        }
        """
        serializer = FieldDataSerializer(data=request.data)
        
        if serializer.is_valid():
            validated_data = serializer.validated_data
            
            # Process the data
            field_info = validated_data.get('field')
            geojson_data = validated_data.get('data')
            global_max = validated_data.get('globalMax', '')
            
            # Here you can add logic to process, store, or analyze the field data
            response_data = {
                'message': 'Field data received successfully',
                'field_id': field_info.get('id'),
                'crop_type': field_info.get('cropType'),
                'features_count': len(geojson_data.get('features', [])),
                'global_max': global_max
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)