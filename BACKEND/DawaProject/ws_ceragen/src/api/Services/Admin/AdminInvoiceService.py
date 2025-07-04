from flask_restful import Resource
from flask import request

from ...Components.Admin.AdminExpenseComponent import AdminExpenseComponent
from ...Components.Admin.AdminInvoiceComponent import AdminInvoiceComponent
from ...Model.Request.Admin.ExpenseRequest import ExpenseCreateRequest, ExpenseUpdateRequest
from ...Model.Request.Admin.InvoiceRequiest import InvoiceCreateRequest, InvoiceUpdateRequest
from ....utils.common.convert_float import convert_decimal_to_float
from ....utils.general.logs import HandleLogs
from ....utils.general.response import (
    response_success,
    response_not_found,
    response_error,
    response_unauthorize
)
from ...Components.Security.TokenComponent import TokenComponent


class AdminInvoiceService_GetAll(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Listado de factura")

            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")

            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = AdminInvoiceComponent.ListAllInvoice()
            if res['result']:
                data = convert_decimal_to_float(res["data"])
                return response_success(data) if data else response_not_found()

            return response_error("No existen datos")
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminInvoiceService_GetById(Resource):
    @staticmethod
    def get(exp_id):
        try:
            HandleLogs.write_log(f"Consulta de gasto por ID {exp_id}")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = AdminExpenseComponent.ExpenseById(exp_id)
            return response_success(res) if res and res["data"] else response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminInvoiceService_Add(Resource):
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

            schema = InvoiceCreateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Errores en validación: " + str(errors))
                return response_error("Errores en validación: " + str(errors))

            data["user_process"] = TokenComponent.User(token)
            result = AdminInvoiceComponent.AddInvoice(data)
            if result["result"]:
                return response_success(f"Id de Registro -> {result['data']}")
            return response_error(result["message"])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminInvoiceService_Update(Resource):
    @staticmethod
    def patch():
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.get_json()
            if not data or not data.get("exp_id"):
                return response_error("Datos inválidos o ID faltante")

            schema = InvoiceUpdateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Errores en validación: " + str(errors))
                return response_error("Errores en validación: " + str(errors))

            data["user_process"] = TokenComponent.User(token)
            result = AdminExpenseComponent.UpdateExpense(data)
            if result["result"]:
                return response_success("Gasto actualizado correctamente")
            return response_error(result["message"])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminInvoiceService_Delete(Resource):
    @staticmethod
    def delete(inv_id):
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            user = TokenComponent.User(token)
            result = AdminInvoiceComponent.DeleteInvoice(inv_id, user)
            if result["result"]:
                return response_success(result["message"])
            return response_not_found(result["message"])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))
