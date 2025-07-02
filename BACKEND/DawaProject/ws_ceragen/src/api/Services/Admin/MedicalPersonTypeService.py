from flask_restful import Resource
from flask import request

from ...Components.Admin.MedicPersonTypeComponent import MedicPersonTypeComponent
from ...Components.Admin.TherapyTypeComponent import TherapyTypeComponent
from ...Model.Request.Admin.MedicPersonTypeRequest import MedicPersonTypeCreateRequest, MedicPersonTypeUpdateRequest
from ....utils.general.logs import HandleLogs
from ....utils.general.response import (
    response_success,
    response_not_found,
    response_error,
    response_unauthorize
)
from ...Model.Request.Admin.TherapyTypeRequest import (
    TherapyTypeCreateRequest,
    TherapyTypeUpdateRequest
)
from ...Components.Security.TokenComponent import TokenComponent


class MedicPersonTypeService_GetAll(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Listado de tipos de personal médico")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = MedicPersonTypeComponent.ListAllMedicPersonTypes()
            return response_success(res) if res and res["data"] else response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))

class MedicPersonTypeService_GetById(Resource):
    @staticmethod
    def get(mpt_id):
        try:
            HandleLogs.write_log(f"Obtener tipo de personal médico ID: {mpt_id}")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = MedicPersonTypeComponent.GetMedicPersonTypeById(mpt_id)
            return response_success(res) if res else response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class MedicPersonTypeService_Add(Resource):
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

            schema = MedicPersonTypeCreateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Errores en validación: " + str(errors))
                return response_error("Errores en validación: " + str(errors))

            data["user_process"] = TokenComponent.User(token)
            result = MedicPersonTypeComponent.AddMedicPersonType(data)
            if result["result"]:
                return response_success(f"Id de Registro -> {result['data']}")
            return response_error(result["message"])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class MedicPersonTypeService_Update(Resource):
    @staticmethod
    def patch():
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.get_json()
            if not data:
                return response_error("Datos inválidos")

            schema = MedicPersonTypeUpdateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Errores en validación: " + str(errors))
                return response_error("Errores en validación: " + str(errors))

            data["user_process"] = TokenComponent.User(token)
            result = MedicPersonTypeComponent.UpdateMedicPersonType(data)
            if result["result"]:
                if result["data"]["data"] == 0:
                    return response_not_found()
                return response_success(data)
            return response_error(result["message"])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))

class MedicPersonTypeService_Delete(Resource):
    @staticmethod
    def patch(mpt_id):
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            user = TokenComponent.User(token)
            res, msg = MedicPersonTypeComponent.DeleteMedicPersonType(mpt_id, user)
            return response_success(msg) if res else response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))
