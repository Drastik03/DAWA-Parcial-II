from flask_restful import Resource
from flask import request

from ....utils.general.logs import HandleLogs
from ....utils.general.response import (
    response_success,
    response_not_found,
    response_error,
    response_unauthorize
)

from ...Components.Admin.MedicalStaffComponent import MedicalStaffComponent
from ...Components.Security.TokenComponent import TokenComponent
from ...Model.Request.Admin.MedicalStaffRequest import (
    MedicalStaffInsertRequest,
    MedicalStaffUpdateRequest,
    MedicalStaffDeleteRequest
)


class MedicalStaffService_GetAll(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Listado de personal médico")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = MedicalStaffComponent.ListAllMedicalStaff()
            # res expected: {'result': bool, 'message': str, 'data': [...]}
            return response_success(res) if res and res.get("data") else response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class MedicalStaffService_GetById(Resource):
    @staticmethod
    def get(med_id):
        try:
            HandleLogs.write_log(f"Consulta personal médico por ID {med_id}")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = MedicalStaffComponent.getMedicalStaffById(med_id)
            return response_success(res) if res and res.get("data") else response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class MedicalStaffService_Add(Resource):
    @staticmethod
    def post():
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.get_json()
            if not data:
                return response_error("Datos inválidos")

            schema = MedicalStaffInsertRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Errores en validación: " + str(errors))
                return response_error("Errores en validación: " + str(errors))

            data["user_created"] = TokenComponent.User(token)

            result = MedicalStaffComponent.createMedicalStaff(data)
            HandleLogs.write_log(result)
            if result.get("result"):
                med_id = result.get("data", {}).get("med_id")
                return response_success({"med_id": med_id} if med_id else {})
            return response_error(result.get("message"))
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class MedicalStaffService_Update(Resource):
    @staticmethod
    def patch(med_id):
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.get_json()
            if not data:
                return response_error("Datos inválidos")

            schema = MedicalStaffUpdateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Errores en validación: " + str(errors))
                return response_error("Errores en validación: " + str(errors))

            data["user_modified"] = TokenComponent.User(token)

            result = MedicalStaffComponent.updateMedicalStaff(med_id, data)
            if result.get("result"):
                return response_success({"med_id": med_id})
            msg = result.get("message", "").lower()
            if "no encontrado" in msg or "no se pudo actualizar" in msg:
                return response_not_found(result.get("message"))
            return response_error(result.get("message"))
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class MedicalStaffService_Delete(Resource):
    @staticmethod
    def delete(med_id):
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.get_json()
            HandleLogs.write_log(data)
            if not data:
                return response_error("Datos inválidos (se espera 'user_deleted')")

            schema = MedicalStaffDeleteRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Errores en validación: " + str(errors))
                return response_error("Errores en validación: " + str(errors))

            user_deleted_by_token = TokenComponent.User(token)

            result = MedicalStaffComponent.deleteMedicalStaff(med_id, user_deleted_by_token)
            if result.get("result"):
                return response_success({"message": result.get("message")})
            msg = result.get("message", "").lower()
            if "no encontrado" in msg or "ya estaba inactivo" in msg:
                return response_not_found(result.get("message"))
            return response_error(result.get("message"))
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))
