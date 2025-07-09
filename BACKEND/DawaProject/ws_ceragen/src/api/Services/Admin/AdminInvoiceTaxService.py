from flask_restful import Resource
from flask import request

from ...Components.Admin.AdminInvoiceTaxComponent import AdminInvoiceTaxComponent
from ...Model.Request.Admin.InvoiceTaxRequest import InvoiceTaxCreateRequest, InvoiceTaxUpdateRequest
from ....utils.general.logs import HandleLogs
from ....utils.general.response import (
    response_success,
    response_not_found,
    response_error,
    response_unauthorize
)
from ...Components.Security.TokenComponent import TokenComponent


class AdminInvoiceTaxService_GetAll(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Listado de impuestos de facturas")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = AdminInvoiceTaxComponent.ListAll()
            return response_success(res) if res and res["data"] else response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminInvoiceTaxService_GetById(Resource):
    @staticmethod
    def get(int_id):
        try:
            HandleLogs.write_log(f"Consulta de impuesto factura por ID {int_id}")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = AdminInvoiceTaxComponent.GetById(int_id)
            return response_success(res) if res and res["data"] else response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminInvoiceTaxService_Add(Resource):
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

            schema = InvoiceTaxCreateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Errores en validación: " + str(errors))
                return response_error("Errores en validación: " + str(errors))

            data["user_process"] = TokenComponent.User(token)
            result = AdminInvoiceTaxComponent.Add(data)
            if result["result"]:
                return response_success(f"Id de Registro -> {result['data']}")
            return response_error(result["message"])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminInvoiceTaxService_Update(Resource):
    @staticmethod
    def patch():
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.get_json()
            HandleLogs.write_log(data)
            if not data or not data.get("int_id"):
                return response_error("Datos inválidos o ID faltante")

            schema = InvoiceTaxUpdateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Errores en validación: " + str(errors))
                return response_error("Errores en validación: " + str(errors))

            data["user_process"] = TokenComponent.User(token)
            result = AdminInvoiceTaxComponent.Update(data)
            if result["result"]:
                return response_success("Impuesto actualizado correctamente")
            return response_error(result["message"])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminInvoiceTaxService_Delete(Resource):
    @staticmethod
    def delete(int_id):
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            user = TokenComponent.User(token)
            result = AdminInvoiceTaxComponent.Delete(int_id, user)
            if result["result"]:
                return response_success(result["message"])
            return response_not_found(result["message"])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminInvoiceTaxService_GetByInvoiceId(Resource):
    @staticmethod
    def get(int_invoice_id):
        try:
            HandleLogs.write_log(f"Consulta de impuestos por factura con ID {int_invoice_id}")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = AdminInvoiceTaxComponent.GetByInvoiceId(int_invoice_id)
            return response_success(res) if res else response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))
