from flask_restful import Resource
from flask import request
from ...Components.Patients.PatientAllergyCatalogComponent import PatientAllergyCatalogComponent
from ....utils.general.response import response_success, response_error, response_unauthorize
from ...Model.Request.Patients.PatientAllergyCatalogRequest import (
    AllergyCatalogInsertRequest,
    AllergyCatalogUpdateRequest
)
from ...Components.Security.TokenComponent import TokenComponent
from marshmallow import ValidationError
from ....utils.general.logs import HandleLogs

class AllergyCatalogInsertService(Resource):
    @staticmethod
    def post():
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()
            user = TokenComponent.User(token)

            data = request.get_json()
            data["user_created"] = user
            validated = AllergyCatalogInsertRequest().load(data)

            result = PatientAllergyCatalogComponent.createAllergy(validated)
            return response_success(result)
        except ValidationError as err:
            return response_error(f"Validación fallida: {err.messages}")
        except Exception as e:
            HandleLogs.write_error(f"[AllergyCatalogInsertService][POST] {str(e)}")
            return response_error("Error al insertar alergia")

class AllergyCatalogUpdateService(Resource):
    @staticmethod
    def patch(al_id):
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()
            user = TokenComponent.User(token)

            data = request.get_json()
            data["user_modified"] = user
            validated = AllergyCatalogUpdateRequest().load(data)

            result = PatientAllergyCatalogComponent.updateAllergy(al_id, validated)
            return response_success(result)
        except ValidationError as err:
            return response_error(f"Validación fallida: {err.messages}")
        except Exception as e:
            HandleLogs.write_error(f"[AllergyCatalogUpdateService][PATCH] {str(e)}")
            return response_error("Error al actualizar alergia")

class AllergyCatalogDeleteService(Resource):
    @staticmethod
    def delete(al_id):
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()
            user = TokenComponent.User(token)

            result = PatientAllergyCatalogComponent.deleteAllergy(al_id, user)
            return response_success(result)
        except Exception as e:
            HandleLogs.write_error(f"[AllergyCatalogDeleteService][DELETE] {str(e)}")
            return response_error("Error al eliminar alergia")

class AllergyCatalogListService(Resource):
    @staticmethod
    def get():
        try:
            token = request.headers.get("tokenapp")
            if not token or not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            result = PatientAllergyCatalogComponent.listActiveAllergies()
            return response_success(result)
        except Exception as e:
            HandleLogs.write_error(f"[AllergyCatalogListService][GET] {str(e)}")
            return response_error("Error al listar alergias")
