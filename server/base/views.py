from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from PIL import Image

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

import numpy as np
import io

@api_view(['POST'])
def register(request):
    
    print(request.data)
    
    firstName = request.data.get('firstName')
    last_name = request.data.get('lastName')
    email = request.data.get('email')
    # Get the image from the request data
    image_mem = request.data.get('imageUpload')

    # Open the image file and convert it to a numpy array
    image = Image.open(io.BytesIO(image_mem.read()))
    image = np.array(image)
    
    print(image)
    
    # TODO: Implement database
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Username is already taken'}, status=status.HTTP_409_CONFLICT)

    # user = User.objects.create_user(username=username, password=password)
    
    # refresh = RefreshToken.for_user(user)
    # return Response({
    #     'refresh': str(refresh),
    #     'access': str(refresh.access_token),
    # })
    return Response({"empty"})


@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user is None:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    })