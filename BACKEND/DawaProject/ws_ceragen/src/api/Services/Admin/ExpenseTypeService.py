from flask_restful import Resource
from flask import request

from ...Components.Admin.ExpenseTypeComponent import ExpenseTypeComponent
from ...Model.Request.Admin.ExpenseTypeRequest import ExpenseTypeCreateRequest, ExpenseTypeUpdateRequest
from ....utils.general.logs import HandleLogs
from ....utils.general.response import (
    response_success,
    response_not_found,
    response_error,
    response_unauthorize
)

from ...Components.Security.TokenComponent import TokenComponent
from ...Components.Admin.AdminClientComponent import AdminClientComponent


class ExpenseTypeService_GetAll(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Listado de tipo de gastos")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = ExpenseTypeComponent.ListAllExpenseType()
            return response_success(res) if res and res["data"] else response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))

class AdminClientServiceAdd(Resource):
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

            schema = ExpenseTypeCreateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Errores en validación: " + str(errors))
                return response_error("Errores en validación: " + str(errors))

            data["user_process"] = TokenComponent.User(token)
            result = AdminClientComponent.AddClient(data)
            if result["result"]:
                return response_success(f"Id de Registro -> {result['data']}")
            return response_error(result["message"])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class ExpenseTypeServiceGetById(Resource):
    @staticmethod
    def get(ext_id):
        try:
            HandleLogs.write_log(f"Consulta de gasto por ID {ext_id}")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = ExpenseTypeComponent.ExpenseTypeById(ext_id)
            return response_success(res) if res and res["data"] else response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class ExpenseTypeServiceAdd(Resource):
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

            schema = ExpenseTypeCreateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Errores en validación: " + str(errors))
                return response_error("Errores en validación: " + str(errors))

            HandleLogs.write_log(data)

            data["user_process"] = TokenComponent.User(token)
            result = ExpenseTypeComponent.AddExpenseType(data)
            if result["result"]:
                return response_success(f"Id de Registro -> {result['data']}")
            return response_error(result["message"])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminExpenseTypeServiceUpdate(Resource):
    @staticmethod
    def patch():
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.get_json()
            if not data or not data.get("ext_id"):
                return response_error("Datos inválidos o ID faltante")

            schema = ExpenseTypeUpdateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Errores en validación: " + str(errors))
                return response_error("Errores en validación: " + str(errors))

            data["user_process"] = TokenComponent.User(token)
            result = ExpenseTypeComponent.UpdateExpenseType(data)
            if result["result"]:
                return response_success("Gasto actualizado correctamente")
            return response_error(result["message"])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminExpenseTypeServiceDelete(Resource):
    @staticmethod
    def delete(ext_id):
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            user = TokenComponent.User(token)
            result, message = ExpenseTypeComponent.DeleteExpenseType(ext_id, user)
            if result:
                return response_success(message)
            return response_not_found(message)

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))