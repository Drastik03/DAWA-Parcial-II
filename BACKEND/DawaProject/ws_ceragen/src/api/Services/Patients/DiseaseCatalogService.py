from flask_restful import Resource
from flask import request
from ...Components.Patients.DiseaseCatalogComponent import DiseaseCatalogComponent
from ....utils.general.response import response_success, response_error, response_unauthorize
from ...Model.Request.Patients.DiseaseCatalogRequest import (
    DiseaseCatalogInsertRequest,
    DiseaseCatalogUpdateRequest
)
from ...Components.Security.TokenComponent import TokenComponent
from marshmallow import ValidationError
from ....utils.general.logs import HandleLogs

class DiseaseCatalogInsertService(Resource):
    @staticmethod
    def post():
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()
            user = TokenComponent.User(token)

            data = request.get_json()
            data["user_created"] = user
            schema = DiseaseCatalogInsertRequest()
            validated = schema.load(data)

            result = DiseaseCatalogComponent.createDiseaseCatalog(validated)
            return response_success(result)
        except ValidationError as err:
            return response_error(f"Validación fallida: {err.messages}")
        except Exception as e:
            HandleLogs.write_error(f"[InsertDiseaseCatalog] {str(e)}")
            return response_error("Error en el servicio")

class DiseaseCatalogUpdateService(Resource):
    @staticmethod
    def patch(dis_id):
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()
            user = TokenComponent.User(token)

            data = request.get_json()
            data["user_modified"] = user
            schema = DiseaseCatalogUpdateRequest()
            validated = schema.load(data)

            result = DiseaseCatalogComponent.updateDiseaseCatalog(dis_id, validated)
            return response_success(result)
        except ValidationError as err:
            return response_error(f"Validación fallida: {err.messages}")
        except Exception as e:
            HandleLogs.write_error(f"[UpdateDiseaseCatalog] {str(e)}")
            return response_error("Error en el servicio")

class DiseaseCatalogListService(Resource):
    @staticmethod
    def get():
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            result = DiseaseCatalogComponent.listDiseaseCatalog()
            return response_success(result)
        except Exception as e:
            HandleLogs.write_error(f"[ListDiseaseCatalog] {str(e)}")
            return response_error("Error en el servicio")


class DiseaseCatalogDeleteService(Resource):
    @staticmethod
    def delete(dis_id):
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            user = TokenComponent.User(token)
            result = DiseaseCatalogComponent.deleteDiseaseCatalog(dis_id, user)

            if result["result"]:
                return response_success(result)
            return response_error(result["message"])
        except Exception as e:
            HandleLogs.write_error(f"[DeleteDiseaseCatalog] {str(e)}")
            return response_error("Error al eliminar enfermedad")