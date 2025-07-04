from flask_restful import Resource
from flask import request
from ...Components.Patients.PatientDiseaseComponent import PatientDiseaseComponent
from ....utils.general.response import response_success, response_error, response_unauthorize
from ...Model.Request.Patients.PatientDiseaseRequest import (
    PatientDiseaseInsertRequest,
    PatientDiseaseUpdateRequest,
    PatientDiseaseDeleteRequest
)
from ...Components.Security.TokenComponent import TokenComponent
from marshmallow import ValidationError
from ....utils.general.logs import HandleLogs

class PatientDiseaseService(Resource):

    @staticmethod
    def get():
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            result = PatientDiseaseComponent.listPatientDiseases()
            return response_success(result)
        except Exception as e:
            HandleLogs.write_error(f"[PatientDiseaseService][GET] {str(e)}")
            return response_error("Error al obtener listado")

    @staticmethod
    def post():
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()
            user = TokenComponent.User(token)

            data = request.get_json()
            data["user_created"] = user
            schema = PatientDiseaseInsertRequest()
            validated = schema.load(data)

            result = PatientDiseaseComponent.createPatientDisease(validated)
            return response_success(result)
        except ValidationError as err:
            return response_error(f"Validación fallida: {err.messages}")
        except Exception as e:
            HandleLogs.write_error(f"[PatientDiseaseService][POST] {str(e)}")
            return response_error("Error al insertar")

    @staticmethod
    def patch(pd_id):
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()
            user = TokenComponent.User(token)

            data = request.get_json()
            data["user_modified"] = user
            data["pd_id"] = pd_id
            schema = PatientDiseaseUpdateRequest()
            validated = schema.load(data)

            result = PatientDiseaseComponent.updatePatientDisease(pd_id, validated)
            return response_success(result)
        except ValidationError as err:
            return response_error(f"Validación fallida: {err.messages}")
        except Exception as e:
            HandleLogs.write_error(f"[PatientDiseaseService][PATCH] {str(e)}")
            return response_error("Error al actualizar")

    @staticmethod
    def delete(pd_id):
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()
            user = TokenComponent.User(token)

            result = PatientDiseaseComponent.deletePatientDisease(pd_id, user)
            return response_success(result)
        except Exception as e:
            HandleLogs.write_error(f"[PatientDiseaseService][DELETE] {str(e)}")
            return response_error("Error al eliminar")
