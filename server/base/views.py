from django.contrib.auth import authenticate

from PIL import Image

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken


from django.contrib.auth import get_user_model

import numpy as np
import io

@api_view(['POST'])
def register(request):
    Users = get_user_model()
    
    print(request.data)
    
    first_name = request.data.get('firstName')
    last_name = request.data.get('lastName')
    email = request.data.get('email')
    # Get the image from the request data
    image_mem = request.data.get('imageUpload')

    # Open the image file and convert it to a numpy array
    image = Image.open(io.BytesIO(image_mem.read()))
    image = np.array(image)
    
    # TODO: Implement database
    if Users.objects.filter(email=email).exists():
        return Response({'error': 'Email is already taken'}, status=status.HTTP_409_CONFLICT)

    user = Users.objects.create_user(email=email, username=first_name, password=None)
    
    refresh = RefreshToken.for_user(user)
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    })

@api_view(['POST'])
def login(request):
    Users = get_user_model()
    
    email = request.data.get('email')
    image_mem = request.data.get('imageUpload')
    
    user = Users.objects.filter(email = email).first()

    ## TODO: Implement auth here
    print(user.email)
    
    if user is None:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    })