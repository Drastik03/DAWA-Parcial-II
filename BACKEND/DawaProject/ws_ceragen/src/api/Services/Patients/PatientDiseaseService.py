from flask_restful import Resource
from flask import request
from ...Components.Patients.PatientDiseaseComponent import PatientDiseaseComponent
from ....utils.general.response import response_success, response_error, response_unauthorize
from ....utils.general.logs import HandleLogs
from ...Components.Security.TokenComponent import TokenComponent
from ...Model.Request.Patients.PatientDiseaseRequest import (
    PatientDiseaseInsertRequest,
    PatientDiseaseUpdateRequest
)
from marshmallow import ValidationError

class PatientDiseaseInsertService(Resource):
    @staticmethod
    def post():
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()
            user = TokenComponent.User(token)

            data = request.get_json()
            data["user_created"] = user
            validated = PatientDiseaseInsertRequest().load(data)

            result = PatientDiseaseComponent.createPatientDisease(validated)
            return response_success(result)
        except ValidationError as err:
            return response_error(f"Validación fallida: {err.messages}")
        except Exception as e:
            HandleLogs.write_error(f"[InsertDiseaseService] {str(e)}")
            return response_error("Error interno")

class PatientDiseaseUpdateService(Resource):
    @staticmethod
    def patch(pd_id):
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()
            user = TokenComponent.User(token)

            data = request.get_json()
            data["user_modified"] = user
            validated = PatientDiseaseUpdateRequest().load(data)

            result = PatientDiseaseComponent.updatePatientDisease(pd_id, validated)
            return response_success(result)
        except ValidationError as err:
            return response_error(f"Validación fallida: {err.messages}")
        except Exception as e:
            HandleLogs.write_error(f"[UpdateDiseaseService] {str(e)}")
            return response_error("Error al actualizar enfermedad")
