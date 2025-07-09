from flask_restful import Resource

from .cloud_service import UploadImageService
from ...Components.Admin.AdminProductComponent import AdminProductComponent
from ....utils.general.logs import HandleLogs
from flask import request
from ....utils.general.response import (
    response_success,
    response_not_found,
    response_error,
    response_unauthorize
)
from ...Model.Request.Admin.ProductRequest import AdminProductSchema, ProductUpdateRequest
from ...Components.Security.TokenComponent import TokenComponent

# MANEJA EL INSERTAR
class AdminProductService_GetAll(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Listado de productos admin")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = AdminProductComponent.list_all_products()
            print("DESDE RESPONSE SERVICE PRODUCT",res)
            if res["data"]:
                return response_success(res)
            else:
                return response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


#MANEJA EL GET PRODUCT ID
class AdminProductService_GetById(Resource):
    @staticmethod
    def get(pro_id):
        try:
            HandleLogs.write_log(f"Obtener producto por ID: {pro_id}")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = AdminProductComponent.get_product_by_id(pro_id)
            return response_success(res) if res else response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


# ADD PRODUCT
class AdminProductService_Add(Resource):
    @staticmethod
    def post():
        try:
            token = request.headers.get("tokenapp")
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.form.to_dict()
            file = request.files.get("file")

            schema = AdminProductSchema()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Error al validar el request -> " + str(errors))
                return response_error("Error al validar el request -> " + str(errors))

            if file:
                upload_res = UploadImageService.upload_image(file, folder="products")
                if not upload_res["result"]:
                    return response_error(upload_res["message"])
                data["pro_image_url"] = upload_res["url"]
            else:
                url_image = data.get("pro_image_url")
                data["pro_image_url"] = url_image if url_image else None

            data["user_created"] = TokenComponent.User(token)

            result = AdminProductComponent.add_product(data)
            if result["result"]:
                return response_success("Id de Registro -> " + str(result["data"]))
            return response_error(result["message"])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))



class AdminProductService_Update(Resource):
    @staticmethod
    def patch():
        try:
            token = request.headers.get("tokenapp")
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.form.to_dict()
            file = request.files.get("file")

            if not data.get("pro_id"):
                return response_error("Falta el ID del producto")

            schema = ProductUpdateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Error al validar el request -> " + str(errors))
                return response_error("Error al validar el request -> " + str(errors))

            if file:
                upload_res = UploadImageService.upload_image(file, folder="products")
                if not upload_res["result"]:
                    return response_error(upload_res["message"])
                data["pro_image_url"] = upload_res["url"]
            else:
                url_image = data.get("pro_image_url")
                data["pro_image_url"] = url_image if url_image else None

            data["user_process"] = TokenComponent.User(token)

            result = AdminProductComponent.update_product(data)
            if result["result"]:
                if result["data"]["data"] == 0:
                    return response_not_found()
                return response_success(data)
            return response_error(result["message"])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))



#MANEJA EL BORRADO
class AdminProductService_Delete(Resource):
    @staticmethod
    def delete(pro_id):
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            user = TokenComponent.User(token)
            res = AdminProductComponent.delete_product(pro_id, user)
            return res
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))
