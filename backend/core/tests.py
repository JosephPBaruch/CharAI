from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient
from .models import Field

"""Tests for the `core` app."""


class FieldNameDescriptionTest(TestCase):
    """Tests that name and description fields are accepted and returned."""

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='pass1234')
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

        self.payload = {
            'field': {
                'id': 'test-field-1',
                'name': 'North Parcel',
                'description': 'Northern section of the farm',
                'cropType': 'WW',
                'price': '10.00',
                'unit': 'bushel',
                'biocharTonsPerHectare': '20',
                'biocharCostPerTon': '120',
            },
            'data': {
                'type': 'FeatureCollection',
                'features': [
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Polygon',
                            'coordinates': [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
                        },
                        'properties': {},
                    }
                ],
            },
        }

    def test_create_field_with_name_and_description(self):
        response = self.client.post('/api/field/', self.payload, format='json')
        self.assertEqual(response.status_code, 202)
        field = Field.objects.get(field_id='test-field-1')
        self.assertEqual(field.name, 'North Parcel')
        self.assertEqual(field.description, 'Northern section of the farm')

    def test_list_fields_includes_name_and_description(self):
        self.client.post('/api/field/', self.payload, format='json')
        response = self.client.get('/api/field/')
        self.assertEqual(response.status_code, 200)
        fields = response.json()['fields']
        self.assertEqual(len(fields), 1)
        self.assertEqual(fields[0]['name'], 'North Parcel')
        self.assertEqual(fields[0]['description'], 'Northern section of the farm')

    def test_create_field_without_name_and_description(self):
        payload = {**self.payload, 'field': {**self.payload['field'], 'id': 'test-field-2'}}
        del payload['field']['name']
        del payload['field']['description']
        response = self.client.post('/api/field/', payload, format='json')
        self.assertEqual(response.status_code, 202)
        field = Field.objects.get(field_id='test-field-2')
        self.assertEqual(field.name, '')
        self.assertEqual(field.description, '')