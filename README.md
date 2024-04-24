# FaBio

Gustavo Bernard Schwarz - Ciência Computação Noturno <br>
TIA: 32141157 <br>
gustavo.b.schwarz@gmail.com

Vincenzo Alberice - Ciência Computação Noturno <br>
TIA: 32135661 <br>
albericevincenzo@gmail.com

Laura Gomes Rodrigues - Ciências Biológicas matutino <br>
TIA: 42315141 <br>
palauragomes@gmail.com

Nikoly Pontes Pinheiro - Ciências Biológicas matutino <br>
TIA: 32399448 <br>
chewbaccanik@gmail.com

Leonardo Nagase Haga - Engenharia Produção Vespertino <br>
TA: 32456913 <br>
leohaga@hotmail.com


### Installing/Running

```bash
docker-compose build
docker-compose up -d
docker-compose exec server python3 manage.py migrate --noinput
```

### Structure

Docker compose is used to create and run the following services:

- `frontend` - React frontend
- `server` - Django backend
- `nginx` - Nginx reverse proxy
- `database` - Postgres database, created by docker-compose


### How this works

This project is a simple Django + React application that uses Django Rest Framework to create a REST API.

Django server creates all the endpoints to register, login and make face side checks.

These are the server endpoints:

---
 - POST `api/register/`
    - body: 
        ```json
        {"email": "", "first_name": "", "something": "", "imageUpload": ""}
        ```

    - response:
        ```json
        {"message": "User created successfully"}
        ```
  ---

 - POST `api/login/`
    - body: 
        ```json
        {"email": "", "imageUpload": ""}
        ```
    - response:
        ```json
        {"message": "User logged in successfully"}
        ```
  ---
 - POST `api/test_side_face/`
  Test if the face is pointing to direction
    - body: 
        ```json
        {"imageUpload": "", "direction": ""}
        ```
    - response:
        ```json
        {"message": "true"}
        ```
    
---

From the endpoints above, the frontend will call the `api/register/` endpoint to register a new user, then the user can login using the `api/login/` endpoint, and also use the `api/test_side_face/` endpoint to test if the face is pointing to the direction.

--- 

##### Face Orientation Detection

The program differentiates between straight and side-facing faces using Haar cascade classifiers:

1. **Frontal Face Detection**: It employs the `haarcascade_frontalface_default.xml` classifier for detecting faces that are oriented straight towards the camera.

2. **Profile Face Detection**: Two instances of `haarcascade_profileface.xml` are used. One detects left-facing profiles directly, and the other is used to detect right-facing profiles by first flipping the image horizontally.

3. **Orientation Determination**:
   - Faces detected by the frontal classifier are considered to be facing straight.
   - Faces detected by the profile classifiers indicate the face is turned to that respective side (left or right).

This method allows the program to effectively determine the orientation of faces in an image.

---

##### Face recognition

The program uses [face_recognition](https://github.com/ageitgey/face_recognition) python library  and encoding to manage user registration and login:

- **Registration**: Users submit their personal information and a photo. The program verifies that the email is unique, then processes and encodes the facial features from the photo, storing these in the database with the user's details.

- **Login**: At login, users provide their email and a new photo. The program retrieves the stored face encoding for that email, processes the new photo to generate current facial encoding, and compares both to verify identity. If they match, the user is granted access; if not, access is denied.

This approach ensures secure access control by linking biometric data with user accounts. It's important to mention that it's made a verification to check if the face is pointing to the right direction before submiting image to login or register.

---

### Selecting custom database

If you want to use a custom database, you can change the `DATABASE` keys in the `.env.dev` file.

### Development

Run the docker compose.
```bash
sudo docker-compose up
```

Run frontend in another terminal.
```bash
cd frontend
npm start
```