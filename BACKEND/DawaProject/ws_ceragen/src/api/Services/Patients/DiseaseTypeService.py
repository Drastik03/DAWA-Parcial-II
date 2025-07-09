from flask_restful import Resource
from flask import request

from ....utils.general.logs import HandleLogs
from ....utils.general.response import internal_response,response_error,response_unauthorize,response_not_found,response_success


from ...Components.Patients.DiseaseTypeComponent import DiseaseTypeComponent
from ...Components.Security.TokenComponent import TokenComponent
from marshmallow import ValidationError

from ...Model.Request.Patients.DiseaseTypeRequest import DiseaseTypeUpdateRequest, DiseaseTypeInsertRequest


class DiseaseTypeInsertService(Resource):
    @staticmethod
    def post():
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()
            user = TokenComponent.User(token)

            data = request.get_json()
            data["user_created"] = user
            validated = DiseaseTypeInsertRequest().load(data)

            result = DiseaseTypeComponent.createDiseaseType(validated)
            return response_success(result)
        except ValidationError as err:
            return response_error(f"Validación fallida: {err.messages}")
        except Exception as e:
            HandleLogs.write_error(f"[InsertDiseaseType][POST] {str(e)}")
            return response_error("Error en el servicio")

class DiseaseTypeUpdateService(Resource):
    @staticmethod
    def patch(dst_id):
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()
            user = TokenComponent.User(token)

            data = request.get_json()
            data["user_modified"] = user
            validated = DiseaseTypeUpdateRequest().load(data)

            result = DiseaseTypeComponent.updateDiseaseType(dst_id, validated)
            return response_success(result)
        except ValidationError as err:
            return response_error(f"Validación fallida: {err.messages}")
        except Exception as e:
            HandleLogs.write_error(f"[UpdateDiseaseType][PATCH] {str(e)}")
            return response_error("Error en el servicio")

class DiseaseTypeDeleteService(Resource):
    @staticmethod
    def delete(dst_id):
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()
            user = TokenComponent.User(token)
            result = DiseaseTypeComponent.deleteDiseaseType(dst_id, user)
            return response_success(result)
        except Exception as e:
            HandleLogs.write_error(f"[DeleteDiseaseType][DELETE] {str(e)}")
            return response_error("Error al eliminar tipo de enfermedad")


class DiseaseTypeListService(Resource):
    @staticmethod
    def get():
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            result = DiseaseTypeComponent.listDiseaseCatalog()
            return response_success(result)
        except Exception as e:
            HandleLogs.write_error(f"[ListDiseaseType][GET] {str(e)}")
            return response_error("Error en el servicio")



