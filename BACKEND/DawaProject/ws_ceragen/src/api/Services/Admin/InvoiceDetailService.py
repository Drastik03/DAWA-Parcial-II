from flask_restful import Resource
from flask import request

from ...Components.Admin.AdminInvoiceDetailComponent import AdminInvoiceDetailComponent
from ...Model.Request.Admin.InvoiceDetailRequest import InvoiceDetailCreateRequest, InvoiceDetailUpdateRequest
from ....utils.common.convert_float import convert_decimal_to_float
from ....utils.general.logs import HandleLogs
from ....utils.general.response import (
    response_success,
    response_not_found,
    response_error,
    response_unauthorize
)
from ...Components.Security.TokenComponent import TokenComponent


class AdminInvoiceDetailService_GetAll(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Listado de detalles de factura")

            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = AdminInvoiceDetailComponent.ListAllDetails()
            if res and res["result"]:
                data = convert_decimal_to_float(res["data"])
                return response_success(data) if data else response_not_found()

            return response_error("No existen detalles registrados")
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminInvoiceDetailService_GetById(Resource):
    @staticmethod
    def get(ind_id):
        try:
            HandleLogs.write_log(f"Consulta de detalle de factura por ID {ind_id}")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = AdminInvoiceDetailComponent.GetDetailById(ind_id)
            return response_success(res) if res and res["data"] else response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminInvoiceDetailService_Add(Resource):
    @staticmethod
    def post():
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.get_json()
            schema = InvoiceDetailCreateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error(f"Errores en validación: {errors}")
                return response_error(f"Errores en validación: {errors}")

            data["user_process"] = TokenComponent.User(token)
            result = AdminInvoiceDetailComponent.AddInvoiceDetail(data)
            if result["result"]:
                return response_success(f"Id de Registro -> {result['data']}")
            return response_error(result["message"])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminInvoiceDetailService_Update(Resource):
    @staticmethod
    def patch():
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.get_json()
            schema = InvoiceDetailUpdateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error(f"Errores en validación: {errors}")
                return response_error(f"Errores en validación: {errors}")

            data["user_process"] = TokenComponent.User(token)
            result = AdminInvoiceDetailComponent.UpdateInvoiceDetail(data)
            if result["result"]:
                return response_success("Detalle de factura actualizado correctamente")
            return response_error(result["message"])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminInvoiceDetailService_Delete(Resource):
    @staticmethod
    def delete(ind_id):
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            user = TokenComponent.User(token)
            result = AdminInvoiceDetailComponent.DeleteInvoiceDetail(ind_id, user)
            if result["result"]:
                return response_success(result["message"])
            return response_not_found(result["message"])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))
