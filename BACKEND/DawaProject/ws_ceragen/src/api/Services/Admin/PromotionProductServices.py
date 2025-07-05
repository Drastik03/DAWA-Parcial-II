from flask_restful import Resource
from ...Components.Admin.AdminProductComponent import AdminProductComponent
from ...Components.Admin.PromotionProductComponent import AdminPromotionComponent
from ...Model.Request.Admin.PromotionRequest import PromotionCreateRequest, PromotionUpdateRequest
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
class AdminPromotionService_GetAll(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Listado de promociones")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = AdminPromotionComponent.list_all_promotion()
            print("DESDE RESPONSE SERVICE PROMOTION",res)
            if res["data"]:
                return response_success(res)
            else:
                return response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


#MANEJA EL GET PRODUCT ID
class AdminPromotionService_GetById(Resource):
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
class AdminPromotionService_Add(Resource):
    @staticmethod
    def post():
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.get_json()
            print("DESDE DATA PROMOTION POST: ",data)
            if not data:
                return response_error("Error en los datos para procesar")

            schema = PromotionCreateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Error al validar el request -> " + str(errors))
                return response_error("Error al validar el request -> " + str(errors))

            result = AdminPromotionComponent.add_promotion(data)
            if result['result']:
                return response_success("Id de Registro -> " + str(result['data']))
            return response_error(result['message'])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


#MANEJA EL UPDATE
class AdminPromotionService_Update(Resource):
    @staticmethod
    def patch():
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.get_json()
            if not data:
                return response_error("Error en los datos para procesar")

            schema = PromotionUpdateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Error al validar el request -> " + str(errors))
                return response_error("Error al validar el request -> " + str(errors))

            result = AdminPromotionComponent.update_promotion(data)
            if result['result']:
                if result['data']['data'] == 0:
                    return response_not_found()
                return response_success(data)
            return response_error(result['message'])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


#MANEJA EL BORRADO
class AdminPromotionService_Delete(Resource):
    @staticmethod
    def delete(pro_id):
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            user = TokenComponent.User(token)
            res = AdminPromotionComponent.delete_promotion(pro_id, user)
            return res
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))
