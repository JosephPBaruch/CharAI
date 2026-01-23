from django.db import models
from django.contrib.auth.models import User

class Field(models.Model):
    """Model for storing user field data"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fields')
    field_id = models.CharField(max_length=255)
    crop_type = models.CharField(max_length=255)
    custom_crop = models.CharField(max_length=255, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)
    global_max = models.CharField(max_length=255, blank=True)
    geojson_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('user', 'field_id')

    def __str__(self):
        return f"{self.field_id} - {self.user.username}"


class PrescriptionMap(models.Model):
    """Model for storing prescription map data for a field"""
    field = models.OneToOneField(Field, on_delete=models.CASCADE, related_name='prescription_map')
    prescription_data = models.JSONField()  # GeoJSON FeatureCollection
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Prescription Map for {self.field.field_id}"
