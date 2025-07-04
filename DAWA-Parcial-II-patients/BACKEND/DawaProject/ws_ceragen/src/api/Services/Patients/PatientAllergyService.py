from flask_restful import Resource
from flask import request
from ...Components.Patients.PatientAllergyComponent import PatientAllergyComponent
from ...Model.Request.Patients.PatientAllergyRequest import (
    PatientAllergyInsertRequest,
    PatientAllergyUpdateRequest,
    PatientAllergyDeleteRequest,
    PatientAllergyListRequest
)
from ...Components.Security.TokenComponent import TokenComponent
from ....utils.general.response import response_success, response_error, response_unauthorize
from ....utils.general.logs import HandleLogs
from marshmallow import ValidationError


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

            schema = PatientAllergyDeleteRequest()
            validated = schema.load({"pa_id": pa_id, "user_modified": user})

            result = PatientAllergyComponent.deletePatientAllergy(validated["pa_id"], validated["user_modified"])
            return response_success(result)
        except ValidationError as err:
            return response_error(f"Validación fallida: {err.messages}")
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

            schema = PatientAllergyListRequest()
            schema.load(request.args)

            result = PatientAllergyComponent.getAllPatientAllergies()
            return response_success(result)
        except ValidationError as err:
            return response_error(f"Validación fallida: {err.messages}")
        except Exception as e:
            HandleLogs.write_error(f"[ListAllergyService] {str(e)}")
            return response_error("Error al listar alergias")
