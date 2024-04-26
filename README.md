# FaBio

### Facial Biometrics

This work was written by Gustavo Schwarz and Vincenzo Alberice in collaboration with Laura Gomes Rodrigues, Nikoly Pontes Pinheiro and Leonardo Nagase Haga.

Facial Biometrics (**FaBio**) is a real time `life proof` and `facial authentication` in a web server.

![home](https://github.com/Schwarzam/FaBio/blob/main/gh_images/Screenshot%202024-04-26%20at%2015.20.02.png)

### Installing/Running

```bash
docker-compose build
docker-compose up -d
docker-compose exec server python3 manage.py migrate --noinput
```

This assures that the server runs without any pains on Windows, MacOS and Linux, whatever supports docker.

From these commands, the application will be running on `https://localhost` or `https://127.0.0.1`

Notice that it is listening on port 443, because some browsers do not allow the camera to be accessed on non-secure connections.
So a non-authority certificate is generated inside docker to allow the connection to be secure.

### Structure

Docker compose is used to create and run the following services:

- `frontend` - ReactJS frontend (/frontend)
- `server` - Django backend (/server)
- `nginx` - Nginx reverse proxy (/nginx)
- `database` - Postgres database, created by docker-compose

### How this works

This project is a simple Django + ReactJS application that uses Django Rest Framework to create a REST API. NGINX is used as a reverse proxy to serve the frontend and backend on the same domain. It also adds a layer of security by hiding the backend server from the public. The frontend is a simple React application that allows users to register, login, and test if the face is pointing to the right direction. 

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

The program uses [face_recognition](https://github.com/ageitgey/face_recognition) python library  and encoding to manage user registration and login. This library is open source and was trained over the Labeled Faces in the Wild (LFW) dataset, which contains 13,000 images of faces from the internet. It has a reported accuracy of 99.38% on the LFW dataset.

We use `face_recognition.face_encodings()` method to generate a 128-dimensional encoding of the face from an image, which is then stored in the database. During login, the program retrieves the stored encodings and compares them to the encoding of the new image to verify the user's identity.

- **Registration**: Users submit their personal information and a photo. The program verifies that the email is unique, then processes and encodes the facial features from 2 photos, storing these in the database with the user's details.

- **Login**: At login, users provide their email and 2 new photos. The program retrieves the stored faces encodings for that email, processes the new photo to generate current facial encoding, and compares all stored encondigs to new ones to verify identity. If they match, the user is granted access; if not, access is denied.

This approach ensures secure access control by linking biometric data with user accounts. It's important to mention that it's made a verification to check if the face is pointing to the right direction before submiting image to login or register.

---
![register](https://github.com/Schwarzam/FaBio/blob/main/gh_images/Screenshot%202024-04-26%20at%2015.20.50.png)
---

### A quick guide to those who don't are familiar

- **Docker**: Docker is a platform for developing, shipping, and running applications in containers. Containers allow a developer to package up an application with all parts it needs, such as libraries and other dependencies, and ship it all out as one package. This makes it easy to deploy and run the application on any machine that supports Docker.

All you need is to create a `Dockerfile` that contains the instructions to build the image, and a `docker-compose.yml` file that defines the services, networks, and volumes for the application. You can see that in this project, we have a `Dockerfile` for the frontend, backend, and nginx, and a `docker-compose.yml` that defines the services for the frontend, backend, nginx, and database.

- **ReactJS**: ReactJS is a JavaScript library for building user interfaces. It allows developers to create reusable UI components and build complex, interactive web applications. React uses a declarative programming model, which makes it easier to reason about the application's state and how it changes over time. It's located in the `frontend` folder. and all the pages are inside the `src` folder.

- **Django**: Django is a high-level Python web framework that encourages rapid development and clean, pragmatic design. It follows the model-template-views (MTV) architectural pattern, which is similar to the model-view-controller (MVC) pattern. Django provides a set of tools and libraries that help developers build web applications quickly and efficiently. It's located in the `server` folder, and all the endpoints are inside the `base/views.py` folder.

### One important thing

The server was designed in a modular way, so you can easily add new endpoints, models, and serializers. The frontend was also designed in a modular way, so you can easily add new pages, components, and styles. We value this modularity because it makes the code more maintainable, scalable, and testable.

### Selecting custom database

If you want to use a custom database, you can change the `DATABASE` keys in the `.env.dev` file.

### Development

Run the docker compose:
```bash
sudo docker-compose up
```

Run frontend in another terminal the frontend:
```bash
cd frontend
npm start
```
