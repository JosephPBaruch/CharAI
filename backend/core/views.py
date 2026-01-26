from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer, FieldDataSerializer, FieldModelSerializer, PrescriptionMapSerializer
from .models import Field, PrescriptionMap

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
            
            # Create or update the field record
            field, created = Field.objects.update_or_create(
                user=request.user,
                field_id=field_info.get('id'),
                defaults={
                    'crop_type': field_info.get('cropType'),
                    'custom_crop': field_info.get('customCrop', ''),
                    'price': field_info.get('price'),
                    'unit': field_info.get('unit'),
                    'global_max': global_max,
                    'geojson_data': geojson_data,
                }
            )
            
            response_data = {
                'message': 'Field data received successfully',
                'created': created,
                'field_id': field.field_id,
                'crop_type': field.crop_type,
                'features_count': len(geojson_data.get('features', [])),
                'global_max': global_max
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PrescriptionMapView(APIView):
    """API endpoint to retrieve prescription map data for a field"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, field_id):
        """
        Get prescription map data for a specific field
        
        Returns sample prescription map data with GeoJSON features
        """
        try:
            field = Field.objects.get(user=request.user, field_id=field_id)
        except Field.DoesNotExist:
            return Response({
                'error': 'Field not found'
            }, status=status.HTTP_404_NOT_FOUND)
            
        # TODO: Check to see if prescription map already exists (if it does, return it and don't create a new one)
        
        # TODO: Format coordinates from field.geojson_data
        # coords = format_coordinates(field.geojson_data)
            
        # TODO: Geotiff generator call here
        # tiff_file_path = generate_geotiff(coords)
        
        # TODO: Geotiff parsers here
        # field_data = parse_geotiff(tiff_file_path)
        
        # TODO: Fetch additional data here
        # field_data = fetch_additional_data(field_data)
        
        # TODO: Duplicate the data set (set1, set2)
        # field_data_set1 = field_data
        # field_data_set1 = field_data
        
        # TODO: Modify the data set2 with effect of biochar
        # field_data_set2 = apply_biochar_effect(field_data)
        
        # TODO: Send set1 to yield predictor/calculator
        # prediction1 = yield_predictor(field_data_set1)
        
        # TODO: Send set2 (biochar) to yield predictor
        # prediction2 = yield_predictor(field_data_set2)
        
        # TODO: send predicton1 and prediction2 to prescription map genreator
        # prescription_map_data = generate_prescription_map(prediction1, prediction2)
        
        # TODO: Format and send prescirption map data (continue this below)
        
        # Get or create prescription map
        prescription_map, _ = PrescriptionMap.objects.get_or_create(
            field=field,
            defaults={
                'prescription_data': {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            'type': 'Feature',
                            'properties': {
                                'applicationRate': 5.5,
                                'paybackPeriod': 3,
                                'type': 'boundary'
                            },
                            'geometry': {
                                'type': 'Polygon',
                                'coordinates': [[
                                    [-117.12799072265626, 47.410866618794536],
                                    [-117.06481933593751, 47.379713888843426],
                                    [-117.15545654296876, 47.33597602644443],
                                    [-117.12799072265626, 47.410866618794536]
                                ]]
                            }
                        },
                        {
                            'type': 'Feature',
                            'properties': {
                                'applicationRate': 3.2,
                                'paybackPeriod': 2,
                                'type': 'zone'
                            },
                            'geometry': {
                                'type': 'Polygon',
                                'coordinates': [[
                                    [-117.06481933593751, 47.379713888843426],
                                    [-117.00164794921876, 47.348561159292175],
                                    [-117.09228515625, 47.30482329634525],
                                    [-117.06481933593751, 47.379713888843426]
                                ]]
                            }
                        }
                    ]
                }
            }
        )
        
        serializer = PrescriptionMapSerializer(prescription_map)
        return Response(serializer.data, status=status.HTTP_200_OK)