from django.db import models
from django.contrib.auth.models import User

from .crop_types import CROP_TYPE_CHOICES


class Field(models.Model):
    """Model for storing user field data"""
    STATUS_PENDING = 'pending'
    STATUS_STARTED = 'started'
    STATUS_COMPLETE = 'complete'
    STATUS_FAILED = 'failed'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_STARTED, 'Started'),
        (STATUS_COMPLETE, 'Complete'),
        (STATUS_FAILED, 'Failed'),
    ]

    # Crop types extracted from the yield-prediction training CSV.
    CROP_TYPE_CHOICES = CROP_TYPE_CHOICES

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fields')
    field_id = models.CharField(max_length=255)
    crop_type = models.CharField(max_length=2, choices=CROP_TYPE_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)
    biochar_tons_per_hectare = models.DecimalField(max_digits=10, decimal_places=4, default=20)
    biochar_cost_per_ton = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    geojson_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    prescription_map_file = models.CharField(max_length=255, blank=True, default='')
    prescription_map_status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
    )

    class Meta:
        ordering = ['-created_at']
        unique_together = ('user', 'field_id')

    def __str__(self):
        return f"{self.field_id} - {self.user.username}"


class PrescriptionMap(models.Model):
    """Model for storing computed prescription map data for a field."""

    field = models.OneToOneField(
        Field,
        on_delete=models.CASCADE,
        related_name='prescription_map',
    )
    prescription_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"PrescriptionMap(field={self.field.field_id})"