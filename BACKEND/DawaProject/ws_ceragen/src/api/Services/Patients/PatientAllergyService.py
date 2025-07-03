from flask_restful import Resource
from flask import request
from ...Components.Patients.PatientAllergyComponent import PatientAllergyComponent
from ....utils.general.response import response_success, response_error, response_unauthorize
from ...Model.Request.Patients.PatientAllergyRequest import (
    PatientAllergyInsertRequest,
    PatientAllergyUpdateRequest
)
from ...Components.Security.TokenComponent import TokenComponent
from marshmallow import ValidationError
from ....utils.general.logs import HandleLogs

class PatientAllergyInsertService(Resource):
    @staticmethod
    def post():
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()
            user = TokenComponent.User(token)

            data = request.get_json()
            data["user_created"] = user
            schema = PatientAllergyInsertRequest()
            validated = schema.load(data)

            result = PatientAllergyComponent.createPatientAllergy(validated)
            return response_success(result)
        except ValidationError as err:
            return response_error(f"Validación fallida: {err.messages}")
        except Exception as e:
            HandleLogs.write_error(f"[InsertAllergyService] {str(e)}")
            return response_error("Error en servicio")

class PatientAllergyUpdateService(Resource):
    @staticmethod
    def patch(pa_id):
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()
            user = TokenComponent.User(token)

            data = request.get_json()
            data["user_modified"] = user
            schema = PatientAllergyUpdateRequest()
            validated = schema.load(data)

            result = PatientAllergyComponent.updatePatientAllergy(pa_id, validated)
            return response_success(result)
        except ValidationError as err:
            return response_error(f"Validación fallida: {err.messages}")
        except Exception as e:
            HandleLogs.write_error(f"[UpdateAllergyService] {str(e)}")
            return response_error("Error al actualizar")
