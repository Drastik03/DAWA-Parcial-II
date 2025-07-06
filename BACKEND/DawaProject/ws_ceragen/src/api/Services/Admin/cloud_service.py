from datetime import datetime
import cloudinary
import cloudinary.uploader
from cloudinary.exceptions import Error as CloudinaryError
from ....utils.general.config import CONFIG_CLOUD

CONFIG_CLOUD.configure()

class UploadImageService:
    @staticmethod
    def upload_image(file, folder="uploads", public_id=None, transformations=None):
        try:
            if not public_id:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                public_id = f"/img_{timestamp}"

            upload_options = {
                "folder": folder,
                "public_id": public_id,
                "use_filename": False,
                "unique_filename": False,
                "overwrite": True
            }

            if transformations:
                upload_options["transformation"] = transformations

            result = cloudinary.uploader.upload(file, **upload_options)
            return {
                "result": True,
                "message": "Imagen subida correctamente",
                "url": result.get("secure_url"),
                "public_id": result.get("public_id"),
                "data": result
            }

        except CloudinaryError as e:
            return {
                "result": False,
                "message": f"Error al subir imagen: {str(e)}",
                "data": {}
            }
