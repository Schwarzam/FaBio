from django.db import models


class MyUser(models.Model):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    something = models.CharField(max_length=200)
    face_encoding_array = models.BinaryField()
    
    def __str__(self):
        return self.email

class Tokens(models.Model):
    token = models.CharField(max_length=16)
    
    def __str__(self):
        return self.token