import cv2

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
left_profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_profileface.xml")
right_profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_profileface.xml")

# Settings for the classifiers
settings = {
    'scaleFactor': 1.3,
    'minNeighbors': 5,
    'minSize': (50, 50),
    'flags': cv2.CASCADE_SCALE_IMAGE
}

def turn_left_detection(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    left_profiles = left_profile_cascade.detectMultiScale(gray, **settings)
    if len(left_profiles) > 0:
        return True
    return False

def turn_right_detection(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    right_profiles = right_profile_cascade.detectMultiScale(cv2.flip(gray, 1), **settings)
    if len(right_profiles) > 0:
        return True
    return False

def verify_number_faces(image):
    # Load the Haar Cascade for face detection
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)  # Convert to grayscale for detection

    # Detect faces in the image
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    
    # Count the number of faces detected
    num_faces = len(faces)
    return num_faces