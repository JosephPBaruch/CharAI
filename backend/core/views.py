from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.conf import settings
from django.http import StreamingHttpResponse
import gzip
import io
import logging
import json
import os
from .models import Field
from .crop_types import CROP_TYPE_CHOICES
from .serializers import RegisterSerializer, UserSerializer, FieldDataSerializer, FieldModelSerializer, ChangePasswordSerializer
from .services import enqueue_prescription_map_job

logger = logging.getLogger("charai")

# api calls & endpoints

class CropTypesView(APIView):
    """API endpoint to retrieve valid crop type codes.

    The set of codes is derived at startup from the yield-prediction
    training CSV so it stays in sync with the ML model automatically.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        crop_types = [
            {"code": code, "label": label}
            for code, label in CROP_TYPE_CHOICES
        ]
        return Response(crop_types, status=status.HTTP_200_OK)
    
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


class ChangePasswordView(APIView):
    """API endpoint for changing user password"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            if not request.user.check_password(serializer.validated_data['current_password']):
                return Response(
                    {'current_password': ['Current password is incorrect.']},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            # Delete old token and create a new one
            try:
                request.user.auth_token.delete()
            except Exception:
                pass
            token = Token.objects.create(user=request.user)
            return Response({
                'message': 'Password changed successfully.',
                'token': token.key,
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteAccountView(APIView):
    """API endpoint for deleting user account"""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        password = request.data.get('password')
        if not password:
            return Response(
                {'password': ['Password is required to delete account.']},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not request.user.check_password(password):
            return Response(
                {'password': ['Password is incorrect.']},
                status=status.HTTP_400_BAD_REQUEST,
            )
        request.user.delete()
        return Response(
            {'message': 'Account deleted successfully.'},
            status=status.HTTP_200_OK,
        )


class FieldDataView(APIView):
    """API endpoint for processing prescription map field data"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Get all fields for the current user with their IDs
        
        Returns:
        {
            "fields": [
                {
                    "id": 1,
                    "field_id": "main-field",
                    "crop_type": "Wheat",
                    ...
                },
                ...
            ]
        }
        """
        fields = Field.objects.filter(user=request.user)
        serializer = FieldModelSerializer(fields, many=True)
        return Response({
            'fields': serializer.data
        }, status=status.HTTP_200_OK)

    def delete(self, request):
        field_id = (
            request.data.get('field_id')
            or request.data.get('id')
            or request.query_params.get('field_id')
            or request.query_params.get('id')
        )

        if not field_id:
            return Response({
                'error': 'field_id is required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            field = Field.objects.get(user=request.user, field_id=field_id)
        except Field.DoesNotExist:
            return Response({
                'error': 'Field not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        prescription_map_file = field.prescription_map_file
        field.delete()

        if prescription_map_file:
            file_path = os.path.join(settings.BASE_DIR, prescription_map_file)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except OSError:
                    logger.warning(
                        'Field deleted but failed to remove prescription file for field_id=%s',
                        field_id,
                    )

        return Response({
            'message': 'Field deleted successfully.',
            'field_id': field_id,
        }, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = FieldDataSerializer(data=request.data)

        if serializer.is_valid():
            validated_data = serializer.validated_data

            field_info = validated_data.get('field')
            geojson_data = validated_data.get('data')
            requested_field_id = field_info.get('id')

            try:
                field = Field.objects.get(user=request.user, field_id=requested_field_id)
                created = False
            except Field.DoesNotExist:
                user_field_count = Field.objects.filter(user=request.user).count()
                if user_field_count >= 3:
                    return Response({
                        'error': 'Field limit reached. Maximum allowed is 3 fields per user.'
                    }, status=status.HTTP_400_BAD_REQUEST)

                field = Field(
                    user=request.user,
                    field_id=requested_field_id,
                )
                created = True

            field.crop_type = field_info.get('cropType')
            field.name = field_info.get('name', '')
            field.description = field_info.get('description', '')
            field.price = field_info.get('price')
            field.unit = field_info.get('unit')
            field.biochar_tons_per_hectare = field_info.get('biocharTonsPerHectare', 20)
            field.biochar_cost_per_ton = field_info.get('biocharCostPerTon')
            field.geojson_data = geojson_data
            field.prescription_map_status = Field.STATUS_PENDING
            field.save()

            enqueue_prescription_map_job(logger, field)

            response_data = {
                'message': 'Field data received and prescription map generation submitted.',
                'created': created,
                'field_id': field.field_id,
                'crop_type': field.crop_type,
                'features_count': len(geojson_data.get('features', [])),
                'biochar_tons_per_hectare': str(field.biochar_tons_per_hectare),
                'biochar_cost_per_ton': str(field.biochar_cost_per_ton),
                'prescription_map_status': field.prescription_map_status,
                'prescription_map_file': field.prescription_map_file,
            }

            return Response(response_data, status=status.HTTP_202_ACCEPTED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FieldPrescriptionView(APIView):
    """API endpoint to retrieve a stored prescription map for a field"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, field_id):
        try:
            field = Field.objects.get(user=request.user, field_id=field_id)
        except Field.DoesNotExist:
            return Response({
                'error': 'Field not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        if field.prescription_map_status != Field.STATUS_COMPLETE:
            return Response({
                'field_id': field.field_id,
                'prescription_map_status': field.prescription_map_status,
                'message': 'Prescription map is not ready yet.',
            }, status=status.HTTP_202_ACCEPTED)

        if not field.prescription_map_file:
            return Response({
                'error': 'Prescription map file path is missing for this field.',
                'field_id': field.field_id,
                'prescription_map_status': field.prescription_map_status,
            }, status=status.HTTP_404_NOT_FOUND)

        file_path = os.path.join(settings.BASE_DIR, field.prescription_map_file)
        if not os.path.exists(file_path):
            return Response({
                'error': 'Prescription map file does not exist.',
                'field_id': field.field_id,
                'prescription_map_status': field.prescription_map_status,
            }, status=status.HTTP_404_NOT_FOUND)

        with open(file_path, 'r', encoding='utf-8') as prescription_file:
            data = json.load(prescription_file)

        # Compress and stream the response to avoid rate-limiting on large payloads
        response_data = {
            'field_id': field.field_id,
            'name': field.name,
            'description': field.description,
            'prescription_map_status': field.prescription_map_status,
            'prescription_map': data,
        }

        def stream_compressed_json(payload):
            json_bytes = json.dumps(payload).encode('utf-8')
            buf = io.BytesIO()
            chunk_size = 8192
            with gzip.GzipFile(fileobj=buf, mode='wb') as gz:
                for i in range(0, len(json_bytes), chunk_size):
                    gz.write(json_bytes[i:i + chunk_size])
                    gz.flush()
                    buf.seek(0)
                    chunk = buf.read()
                    if chunk:
                        yield chunk
                    buf.seek(0)
                    buf.truncate()
            # Yield remaining data (gzip footer)
            buf.seek(0)
            remaining = buf.read()
            if remaining:
                yield remaining

        response = StreamingHttpResponse(
            streaming_content=stream_compressed_json(response_data),
            content_type='application/json',
            status=200,
        )
        response['Content-Encoding'] = 'gzip'
        return response
