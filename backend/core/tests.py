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


class ChangePasswordTest(TestCase):
    """Tests for the change-password endpoint."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='pwuser', password='OldPass123!', email='pw@example.com',
        )
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_change_password_success(self):
        response = self.client.post('/api/auth/change-password/', {
            'current_password': 'OldPass123!',
            'new_password': 'NewPass456!',
            'new_password2': 'NewPass456!',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.json())
        # Old token should be invalid
        self.assertFalse(Token.objects.filter(key=self.token.key).exists())
        # User can authenticate with new password
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPass456!'))

    def test_change_password_wrong_current(self):
        response = self.client.post('/api/auth/change-password/', {
            'current_password': 'WrongPass!',
            'new_password': 'NewPass456!',
            'new_password2': 'NewPass456!',
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('current_password', response.json())

    def test_change_password_mismatch(self):
        response = self.client.post('/api/auth/change-password/', {
            'current_password': 'OldPass123!',
            'new_password': 'NewPass456!',
            'new_password2': 'Different789!',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_change_password_unauthenticated(self):
        self.client.credentials()  # Clear auth
        response = self.client.post('/api/auth/change-password/', {
            'current_password': 'OldPass123!',
            'new_password': 'NewPass456!',
            'new_password2': 'NewPass456!',
        }, format='json')
        self.assertEqual(response.status_code, 401)


class DeleteAccountTest(TestCase):
    """Tests for the delete-account endpoint."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='deluser', password='DelPass123!', email='del@example.com',
        )
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_delete_account_success(self):
        response = self.client.delete('/api/auth/delete-account/', {
            'password': 'DelPass123!',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(User.objects.filter(username='deluser').exists())

    def test_delete_account_wrong_password(self):
        response = self.client.delete('/api/auth/delete-account/', {
            'password': 'WrongPass!',
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('password', response.json())
        # User should still exist
        self.assertTrue(User.objects.filter(username='deluser').exists())

    def test_delete_account_missing_password(self):
        response = self.client.delete('/api/auth/delete-account/', {}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('password', response.json())

    def test_delete_account_unauthenticated(self):
        self.client.credentials()  # Clear auth
        response = self.client.delete('/api/auth/delete-account/', {
            'password': 'DelPass123!',
        }, format='json')
        self.assertEqual(response.status_code, 401)