from flask_restful import Resource
from flask import request
from ...Components.Patients.PatientDiseaseComponent import PatientDiseaseComponent
from ....utils.general.response import response_success, response_error, response_unauthorize, response_not_found
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


class PatientDiseaseDeleteService(Resource):
    @staticmethod
    def delete(pd_id):
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()
            user = TokenComponent.User(token)

            result = PatientDiseaseComponent.deletePatientDisease(pd_id, user)
            if result["result"]:
                return response_success(result)
            return response_error(result["message"])
        except Exception as e:
            HandleLogs.write_error(f"[DeleteDiseaseService] {str(e)}")
            return response_error("Error al eliminar enfermedad del paciente")


class PatientDiseaseListService(Resource):
    @staticmethod
    def get():
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            result = PatientDiseaseComponent.listAllPatientDiseases()
            if result["result"]:
                return response_success(result)
            else:
                return response_error(result["message"])
        except Exception as e:
            HandleLogs.write_error(f"[ListDiseaseService] {str(e)}")
            return response_error("Error al listar enfermedades del paciente")


class PatientDiseaseGetByIdService(Resource):
    @staticmethod
    def get(patient_id):
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            result = PatientDiseaseComponent.getDiseasesByPatientId(patient_id)
            if result["result"]:
                return response_success(result)
            return response_error(result["message"])
        except Exception as e:
            HandleLogs.write_error(f"[GetByPatientIdDiseaseService] {str(e)}")
            return response_error("Error al obtener las enfermedades")
