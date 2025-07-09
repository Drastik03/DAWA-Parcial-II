from flask_restful import Resource
from flask import request
from ...Components.Patients.PatientAllergyComponent import PatientAllergyComponent
from ....utils.general.response import response_success, response_error, response_unauthorize, response_not_found
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


class PatientAllergyDeleteService(Resource):
    @staticmethod
    def delete(pa_id):
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()
            user = TokenComponent.User(token)

            result = PatientAllergyComponent.deletePatientAllergy(pa_id, user)
            if result["result"]:
                return response_success(result)
            else:
                return response_not_found(result["message"])
        except Exception as e:
            HandleLogs.write_error(f"[DeleteAllergyService] {str(e)}")
            return response_error("Error al eliminar")



class PatientAllergyListService(Resource):
    @staticmethod
    def get():
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            result = PatientAllergyComponent.getAllPatientAllergies()
            if result["result"]:
                return response_success(result)
            return response_error("No hay nada que mostrar")
        except Exception as e:
            HandleLogs.write_error(f"[ListAllergyService] {str(e)}")
            return response_error("Error al listar alergias")


class PatientAllergyGetByIdService(Resource):
    @staticmethod
    def get(pa_id):
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            result = PatientAllergyComponent.getAllergiesByPatientId(pa_id)
            if result["result"]:
                return response_success(result)
            return response_not_found("Alergia no encontrada")
        except Exception as e:
            HandleLogs.write_error(f"[GetAllergyByIdService] {str(e)}")
            return response_error("Error al obtener alergia por ID")
