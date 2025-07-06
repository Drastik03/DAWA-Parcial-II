import cloudinary
import cloudinary.uploader
import cloudinary.api

from cloudinary import CloudinaryImage
from cloudinary import CloudinaryVideo

cloudinary.config(
  cloud_name = "my_cloud_name",
  api_key = "my_key",
  api_secret = "my_secret"
)

class UploadImageFile():
    @staticmethod
    def upload(file, **options):
        cloudinary.uploader.upload(
            "https://res.cloudinary.com/demo/image/upload/v1702378721/docs/wines.jpg",
            public_id="fine_wine",
            transformation=
            [{"width": 400, "height": 400, "crop": "auto", "gravity": "auto", "effect": "improve:50"}]
        )