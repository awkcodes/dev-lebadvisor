from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import login
from rest_framework.authtoken.serializers import AuthTokenSerializer
from knox.models import AuthToken
from knox.views import (
    LogoutView as KnoxLogoutView,
    LogoutAllView as KnoxLogoutAllView
)
from .serializers import (UserSerializer, RegisterSerializer,
                          CustomerSerializer, SupplierSerializer,
                          UpdateEmailSerializer, UpdatePasswordSerializer,
                          UpdateSupplierLocationSerializer, UpdateCustomerLocationsSerializer,
                          UpdateCustomerPreferencesSerializer, UpdatePhoneSerializer)
from .models import Customer, Supplier
from rest_framework import status
from location.models import Location
from categories.models import Category
import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from .models import PhoneVerification
from .sms_service import send_sms


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_customer_preferences_api(request):
    user = request.user
    if not user.is_customer:
        return Response({"error": "Only customers can update their preferences."}, status=status.HTTP_403_FORBIDDEN)
    try:
        customer = Customer.objects.get(user=user)
    except Customer.DoesNotExist:
        return Response({"error": "Customer profile not found."}, status=status.HTTP_404_NOT_FOUND)
    serializer = UpdateCustomerPreferencesSerializer(customer, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Preferences updated successfully"})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_customer_locations_api(request):
    user = request.user
    if not user.is_customer:
        return Response({"error": "Only customers can update their locations."}, status=status.HTTP_403_FORBIDDEN)
    try:
        customer = Customer.objects.get(user=user)
    except Customer.DoesNotExist:
        return Response({"error": "Customer profile not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = UpdateCustomerLocationsSerializer(customer, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Locations updated successfully"})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_supplier_location_api(request):
    user = request.user
    if not user.is_supplier:
        return Response(
            {"error": "Only suppliers can update their location."},
            status=status.HTTP_403_FORBIDDEN)
    try:
        supplier = Supplier.objects.get(user=user)
    except Supplier.DoesNotExist:
        return Response(
            {"error": "Supplier profile not found."},
            status=status.HTTP_404_NOT_FOUND)
    serializer = UpdateSupplierLocationSerializer(supplier, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Supplier location updated successfully"})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_phone_api(request):
    user = request.user
    serializer = UpdatePhoneSerializer(user, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Phone number updated successfully"})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_email_api(request):
    user = request.user
    serializer = UpdateEmailSerializer(user, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Email updated successfully"})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_password_api(request):
    serializer = UpdatePasswordSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Password updated successfully"})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_api(request):
    user = request.user
    userserializer = UserSerializer(user)
    if user.is_customer:
        customer = Customer.objects.get(user=user)
        profileserializer = CustomerSerializer(customer)
    elif user.is_supplier:
        supplier = Supplier.objects.get(user=user)
        profileserializer = SupplierSerializer(supplier)
    data = {
        "user": userserializer.data,
        "profile": profileserializer.data
    }
    return Response(data)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_api(request):
    phone_number = request.data.get('phone')
    
    # Quick check: if there's still a PhoneVerification record for this number,
    # it means user has not successfully verified. (Because we delete on success.)
    from .models import PhoneVerification
    if PhoneVerification.objects.filter(phone_number=phone_number).exists():
        return Response({"detail": "Phone not verified yet. Please verify your phone first."}, status=400)

    # Continue with your existing registration
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    token = AuthToken.objects.create(user)[1]

    # Initialize Customer if is_customer
    if serializer.is_valid() and not user.is_supplier:
        Customer.objects.create(user=user)
        # Usually you'd do something like:
        # customer = Customer.objects.get(user=user)
        # but you do a direct create in your code

    return Response({
        "user": UserSerializer(user, context={'request': request}).data,
        "token": token
    })



@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    serializer = AuthTokenSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data['user']
    login(request, user)
    token = AuthToken.objects.create(user)[1]
    return Response({
        "user": UserSerializer(user, context={'request': request}).data,
        "token": token
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_api(request):
    return KnoxLogoutView.as_view()(request._request)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_all_api(request):
    return KnoxLogoutAllView.as_view()(request._request)


@api_view(['POST'])
@permission_classes([AllowAny])
def send_verification_code_api(request):
    phone_number = request.data.get('phone_number')
    if not phone_number or not phone_number.startswith("961") or len(phone_number) != 11:
        return Response({"detail": "Invalid phone number. Must be 961xxxxxxxx"}, status=400)

    # Generate a 6-digit code
    code = f"{random.randint(100000, 999999)}"

    # Save or update the code in the database
    verification, created = PhoneVerification.objects.update_or_create(
        phone_number=phone_number,
        defaults={"code": code, "created_at": timezone.now()}
    )

    # Send the SMS
    message = f"Your verification code is {code}"
    send_sms(phone_number, message)

    return Response({"detail": "Verification code sent."})


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_phone_code_api(request):
    phone_number = request.data.get('phone_number')
    code = request.data.get('code')
    if not phone_number or not code:
        return Response({"detail": "Missing phone_number or code."}, status=400)

    try:
        verification = PhoneVerification.objects.get(phone_number=phone_number)
    except PhoneVerification.DoesNotExist:
        return Response({"detail": "No verification record found."}, status=400)

    if verification.code == code and not verification.is_expired():
        # If correct and not expired, we can mark the phone as verified in a few ways:
        # Option 1: delete the record to indicate success
        verification.delete()
        return Response({"detail": "Phone verified."}, status=200)
    else:
        return Response({"detail": "Invalid or expired code."}, status=400)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_send_code_api(request):
    phone_number = request.data.get('phone_number')
    if not phone_number or not phone_number.startswith("961") or len(phone_number) != 11:
        return Response({"detail": "Invalid phone number."}, status=400)

    # Generate code
    import random
    from django.utils import timezone
    from .models import PhoneVerification

    code = f"{random.randint(100000, 999999)}"
    verification, created = PhoneVerification.objects.update_or_create(
        phone_number=phone_number,
        defaults={"code": code, "created_at": timezone.now()}
    )

    from .sms_service import send_sms
    message = f"Your password reset code is {code}"
    send_sms(phone_number, message)

    return Response({"detail": "Reset code sent."}, status=200)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_verify_code_api(request):
    phone_number = request.data.get('phone_number')
    code = request.data.get('code')

    if not phone_number or not code:
        return Response({"detail": "Missing phone_number or code."}, status=400)

    from .models import PhoneVerification
    try:
        verification = PhoneVerification.objects.get(phone_number=phone_number)
    except PhoneVerification.DoesNotExist:
        return Response({"detail": "No verification record found."}, status=400)

    if verification.code == code and not verification.is_expired():
        verification.delete()  # Means "verified"
        return Response({"detail": "Phone verified for password reset."}, status=200)
    else:
        return Response({"detail": "Invalid or expired code."}, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_api(request):
    phone_number = request.data.get('phone_number')
    new_password = request.data.get('new_password')

    if not phone_number or not new_password:
        return Response({"detail": "Missing phone_number or new_password."}, status=400)

    # If a PhoneVerification entry STILL exists, user didn't verify. 
    # But in our logic, we delete it upon success in step 2. So if it doesn't exist, that means verified.
    from .models import PhoneVerification, CustomUser
    if PhoneVerification.objects.filter(phone_number=phone_number).exists():
        return Response({"detail": "Phone not verified. Please enter the valid code."}, status=400)

    # Find the user with this phone_number
    try:
        user = CustomUser.objects.get(phone=phone_number)
    except CustomUser.DoesNotExist:
        return Response({"detail": "No user with this phone number found."}, status=404)

    # Set new password
    user.set_password(new_password)
    user.save()

    return Response({"detail": "Password reset successful."}, status=200)
