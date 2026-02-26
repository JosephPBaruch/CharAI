from .services import compute_payback_period_grid, convert_df_to_geojson_polygons, parse_and_append_boundary_coordinates
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.management import call_command
from django.conf import settings
from datetime import datetime
import os
import logging

logger = logging.getLogger(__name__)
import logging

logger = logging.getLogger(__name__)
from .serializers import RegisterSerializer, UserSerializer, FieldDataSerializer, FieldModelSerializer, PrescriptionMapSerializer
from .models import Field, PrescriptionMap
from modules.GeoParser import GeoParser
from .yield_calculator import YieldCalculator
from modules.Geotiffgenerator import DEMGeneratorService

# api calls & endpoints
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
            field, created = Field.objects.get_or_create(
                user=request.user,
                defaults={
                    'field_id': 'main-field',
                    'crop_type': field_info.get('cropType'),
                    'custom_crop': field_info.get('customCrop', ''),
                    'price': field_info.get('price'),
                    'unit': field_info.get('unit'),
                    'global_max': global_max,
                    'geojson_data': geojson_data,
                }
            )

            if not created:
                # Update the existing field
                field.crop_type = field_info.get('cropType')
                field.custom_crop = field_info.get('customCrop', '')
                field.price = field_info.get('price')
                field.unit = field_info.get('unit')
                field.global_max = global_max
                field.geojson_data = geojson_data
                field.save()
            
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
        
        # Format coordinates from field.geojson_data
        coords = []
        for feature in field.geojson_data.get('features', []):
            if feature['geometry']['type'] == 'Polygon':
                # Get first ring coordinates
                ring = feature['geometry']['coordinates'][0]
                # Convert from [lon, lat] to (lat, lon)
                coords.extend([(lat, lon) for lon, lat in ring])
        
        # Generate unique filename for the DEM
        dem_dir = os.path.join(settings.MEDIA_ROOT, 'dems')
        os.makedirs(dem_dir, exist_ok=True)
        tiff_file_path = os.path.join(
            dem_dir,
            f'field_{field.id}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.tif'
        )
        
        # Call geotiff generator
        if coords:
            coords_str = [f"{lat},{lon}" for lat, lon in coords]
            geotiff_generator = DEMGeneratorService()
            geotiff_generator.generate_from_coordinates(coords_str, tiff_file_path)
        
        logger.info("Finished generating tiff")
        
        # Parse GeoTIFF and extract terrain data
        try:
            parser = GeoParser(tiff_file_path)
            geotiff_data = parser.parse()
            
            # Convert to cell-based dataframe with terrain metrics
            terrain_df = geotiff_data.to_dataframe(cell_size_meters=5.0)

        except Exception as e: #VERY IMPORTANT TO HAVE THESE EVERYWHERE! This helps catch errors at any point in the process
            return Response({
                'error': f'Failed to parse GeoTIFF: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        logger.info("Finished parsing tiff")
        
        # TODO: Fetch additional data here
        # field_data = fetch_additional_data(field_data)
        
        terrain_df_copy = terrain_df.copy()
        
        try:
            calculator = YieldCalculator()
            
            # Make yield prediction with biochar added
            yield_results_df_biochar = calculator.calculate(terrain_df_copy, use_biochar=True)
            
            # Make yield prediction without biochar added
            yield_results_result_df = calculator.calculate(terrain_df, use_biochar=False)
        except Exception as e:
            return Response({
                'error': f'Failed to make yield predictions: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        logger.info("Finished predicting yield")
        logger.info(f"yield_results_df_biochar shape: {yield_results_df_biochar.shape}")
        logger.info(f"yield_results_df_biochar head:\n{yield_results_df_biochar.head()}")
        # Log full column labels explicitly (avoid pandas truncation) so we can see all ~20 columns
        try:
            logger.info("yield_results_df_biochar columns: %s", list(yield_results_df_biochar.columns))
        except Exception:
            # Fallback to repr in case of unusual Index types
            logger.info("yield_results_df_biochar columns (repr): %s", repr(yield_results_df_biochar.columns))
        logger.info(f"yield_results_result_df shape: {yield_results_result_df.shape}")
        logger.info(f"yield_results_result_df head:\n{yield_results_result_df.head()}")
        try:
            logger.info("yield_results_result_df columns: %s", list(yield_results_result_df.columns))
        except Exception:
            logger.info("yield_results_result_df columns (repr): %s", repr(yield_results_result_df.columns))
        
        # send predicton1 and prediction2 to prescription map genreator
        # prescription_map_data = generate_prescription_map(prediction1, prediction2)
        payback_period_df = compute_payback_period_grid(
            yield_prediction_df=yield_results_df_biochar,
            crop_sales_price=field.price,
            biochar_application_rate=10.0,
            biochar_price=20.0)
        
        prescription_data_geojson = convert_df_to_geojson_polygons(
            payback_period_df=payback_period_df,
            cell_size_meters=10.0,
            biochar_application_rate=10.0
        )

        prescription_data_geojson = parse_and_append_boundary_coordinates(
            prescription_data_geojson,
            field.geojson_data,
        )

        prescription_map, created = PrescriptionMap.objects.get_or_create(
            field=field,
            defaults={'prescription_data': prescription_data_geojson}
        )

        if not created:
            # If map already exists, overwrite it with new data
            prescription_map.prescription_data = prescription_data_geojson
            prescription_map.save()

        serializer = PrescriptionMapSerializer(prescription_map)
        return Response(serializer.data, status=status.HTTP_200_OK)