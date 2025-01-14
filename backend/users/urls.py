from django.urls import path
from .views import (
        register_api,
        login_api,
        logout_api,
        logout_all_api,
        user_api,
        update_email_api,
        update_password_api,
        update_customer_preferences_api,
        update_customer_locations_api,
        update_supplier_location_api,
        update_phone_api,
        send_verification_code_api,
        verify_phone_code_api,
        forgot_password_send_code_api,
        forgot_password_verify_code_api,
        reset_password_api,
        )


urlpatterns = [
    path('update-customer-preferences/',
         update_customer_preferences_api, name='update-customer-preferences'),
    path('update-customer-locations/',
         update_customer_locations_api, name='update-customer-locations'),
    path('update-supplier-location/',
         update_supplier_location_api,
         name='update_supplier_location'),
    path('register/', register_api, name='register'),
    path('login/', login_api, name='login'),
    path('logout/', logout_api, name='logout'),
    path('logoutall/', logout_all_api, name='logoutall'),
    path('user/', user_api, name='user'),
    path('update-email/', update_email_api, name='update_email'),
    path('update-password/', update_password_api, name='update_password'),
    path('update-phone/', update_phone_api, name='update_phone'),  # Added this line
    path('send_verification_code/', send_verification_code_api, name='send_verification_code'),
    path('verify_phone_code/', verify_phone_code_api, name='verify_phone_code'),
    path('forgot_password_send_code/', forgot_password_send_code_api, name='forgot_password_send_code'),
    path('forgot_password_verify_code/', forgot_password_verify_code_api, name='forgot_password_verify_code'),
    path('reset_password/', reset_password_api, name='reset_password'),
]
