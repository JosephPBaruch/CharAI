from django.urls import path
from .views import CropTypesView, FieldDataView, FieldPrescriptionView, RegisterView, LoginView, LogoutView, UserInfoView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/user/', UserInfoView.as_view(), name='user-info'),
    path('crop-types/', CropTypesView.as_view(), name='crop-types'),
    path('field/', FieldDataView.as_view(), name='field-data'),
    path('field/<str:field_id>/', FieldPrescriptionView.as_view(), name='field-prescription'),
]
