# pull official base image
FROM python:3.11.4-slim-buster

# set work directory
WORKDIR /server

# install ffmpeg
RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install dependencies
RUN pip install --upgrade pip
COPY ./requirements.txt .
RUN pip install -r requirements.txt

# copy project
COPY . .