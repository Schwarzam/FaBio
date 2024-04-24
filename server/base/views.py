from django.contrib.auth import authenticate

from PIL import Image

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .helpers import turn_left_detection, turn_right_detection, verify_number_faces

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
    image_mem = request.data.get('imageUpload')

    if Users.objects.filter(email=email).exists():
        return Response({'error': 'Email is already taken'}, status=status.HTTP_409_CONFLICT)
    
    image = Image.open(io.BytesIO(image_mem.read()))

    user = Users.objects.create_user(email=email, username=first_name)
    user.face_image.save(f'{user.username}_face.jpg', image_mem)
    user.save()
    
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
    # Open the image file and convert it to a numpy array
    image = Image.open(io.BytesIO(image_mem.read()))
    image = np.array(image)
    
    print(image)
    
    if user is None:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    })
    

@api_view(['POST'])
def test_side_face(request):
    
    print(request.data)
    
    email = request.data.get('email')
    image_mem = request.data.get('imageUpload')
    direction = request.data.get('direction')
    
    # get numpy array from image
    image = Image.open(io.BytesIO(image_mem.read()))
    image = np.array(image)
    
    if direction == 'left':
        response = turn_left_detection(image)
        return Response({'correct': response})
    elif direction == 'right':
        response = turn_right_detection(image)
        return Response({'correct': response})
    elif direction == 'straight':
        ## TODO: Add straight face detection
        
        n = verify_number_faces(image)
        if n == 1:
            return Response({'correct': True})
        else:
            return Response({'message': "Make sure your face is in the center of the frame and is not obstructed by anything."})
    
    return Response({'message': 'Invalid direction. Please provide a valid direction: left, right, or straight.'})
