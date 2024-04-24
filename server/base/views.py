from django.contrib.auth import authenticate

from PIL import Image

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Tokens, MyUser
from .helpers import turn_left_detection, turn_right_detection, verify_number_faces

from django.contrib.auth import get_user_model

import numpy as np
import io
import secrets

import face_recognition

tokens = []

@api_view(['POST'])
def register(request):
    Users = get_user_model()
    
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    something = request.data.get('something')
    email = request.data.get('email')
    image_mem = request.data.get('imageUpload')
    token = request.data.get('token')
    
    token = Tokens.objects.filter(token=token).first()
    if token is None:
        return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        ## Remove token from tokens
        token.delete()
    
    if Users.objects.filter(email=email).exists():
        return Response({'error': 'Email is already taken'}, status=status.HTTP_409_CONFLICT)
    
    image = Image.open(io.BytesIO(image_mem.read()))
    image = np.array(image)
    
    try:
        face_encoding = face_recognition.face_encodings(image)[0]
    except:
        return Response({'error': 'No face detected in the image', 'redo': 'take'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = MyUser.objects.create(email=email, first_name=first_name, last_name=last_name, something=something)
    user.face_encoding_array = face_encoding.tobytes()
    user.save()
    
    return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
    
@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    
    user = MyUser.objects.filter(email=email).first()
    
    if user is None:
        return Response({'error': 'Email is not registered'}, status=status.HTTP_401_UNAUTHORIZED)
    
    image_mem = request.data.get('imageUpload')
    
    # Open the image file and convert it to a numpy array
    image = Image.open(io.BytesIO(image_mem.read()))
    image = np.array(image)
    
    try:
        encoding = face_recognition.face_encodings(image)[0]
    except:
        return Response({'error': 'No face detected in the image', 'redo': 'take'}, status=status.HTTP_400_BAD_REQUEST)
        
    # Transform face_encoding_bytes <memory at 0xffff6ab98100> to numpy array
    face_encoding = np.frombuffer(user.face_encoding_array, dtype=np.float64)
    
    result = face_recognition.compare_faces([face_encoding], encoding)
    if not result[0]:
        return Response({'error': 'Face does not match'}, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response({'message': result, "first_name": user.first_name, "last_name": user.last_name, "email": user.email, "something": user.something})
    

@api_view(['POST'])
def test_side_face(request):
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
        ## Append random token to tokens
        ## Return token to client
        n = verify_number_faces(image)
        if n == 1:
            return Response({'correct': True})
        else:
            return Response({'message': "Make sure your face is in the center of the frame and is not obstructed by anything."})
    
    elif direction == 'take':
        token = secrets.token_urlsafe(12)
        Tokens.objects.create(token=token)
        
        
        n = verify_number_faces(image)
        if n == 1:
            return Response({'correct': True, 'token': token})
        else:
            return Response({'message': "Make sure your face is in the center of the frame and is not obstructed by anything."})
    
    return Response({'message': 'Invalid direction. Please provide a valid direction: left, right, or straight.'})
