from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Field, PrescriptionMap
from .crop_types import VALID_CROP_CODES


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data"""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        read_only_fields = ('id',)


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return attrs

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class FieldPropertiesSerializer(serializers.Serializer):
    """Serializer for field properties in GeoJSON features"""
    applicationRate = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    paybackPeriod = serializers.IntegerField(required=False)
    type = serializers.CharField(required=False)


class FieldSerializer(serializers.Serializer):
    """Serializer for field metadata"""
    id = serializers.CharField(required=True)
    cropType = serializers.ChoiceField(choices=Field.CROP_TYPE_CHOICES, required=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, required=True, min_value=0)
    unit = serializers.CharField(required=True)


class FieldDataSerializer(serializers.Serializer):
    """Serializer for prescription map data submission"""
    globalMax = serializers.CharField(required=False, allow_blank=True)
    field = FieldSerializer(required=True)
    data = serializers.JSONField(required=True)  # GeoJSON FeatureCollection


class FieldModelSerializer(serializers.ModelSerializer):
    """Serializer for Field model"""
    class Meta:
        model = Field
        fields = (
            'id',
            'field_id',
            'crop_type',
            'price',
            'unit',
            'global_max',
            'prescription_map_status',
            'prescription_map_file',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class PrescriptionMapSerializer(serializers.ModelSerializer):
    """Serializer for PrescriptionMap model"""
    class Meta:
        model = PrescriptionMap
        fields = ('id', 'field', 'prescription_data', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
