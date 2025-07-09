from flask_restful import Resource
from flask import request

from ...Components.Admin.TaxComponent import AdminTaxComponent
from ...Model.Request.Admin.TaxRequest import TaxUpdateRequest, TaxCreateRequest
from ....utils.common.convert_float import convert_decimal_to_float
from ....utils.general.logs import HandleLogs
from ....utils.general.response import (
    response_success,
    response_not_found,
    response_error,
    response_unauthorize
)
from ...Components.Security.TokenComponent import TokenComponent


class AdminTaxService_GetAll(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Listado de impuestos")

            token = request.headers.get("tokenapp")
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = AdminTaxComponent.ListAllTaxes()
            if res["result"]:
                data = convert_decimal_to_float(res["data"])
                return response_success(data) if data else response_not_found()
            return response_error("No existen datos")
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminTaxService_GetById(Resource):
    @staticmethod
    def get(tax_id):
        try:
            HandleLogs.write_log(f"Consulta de impuesto por ID {tax_id}")

            token = request.headers.get("tokenapp")
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = AdminTaxComponent.GetTaxById(tax_id)
            return response_success(res) if res and res["data"] else response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminTaxService_Add(Resource):
    @staticmethod
    def post():
        try:
            token = request.headers.get("tokenapp")
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.get_json()
            if not data:
                return response_error("Datos inválidos")

            schema = TaxCreateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Errores en validación: " + str(errors))
                return response_error("Errores en validación: " + str(errors))

            data["user_process"] = TokenComponent.User(token)
            result = AdminTaxComponent.AddTax(data)
            if result["result"]:
                return response_success(f"Id de Registro -> {result['data']}")
            return response_error(result["message"])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminTaxService_Update(Resource):
    @staticmethod
    def patch():
        try:
            token = request.headers.get("tokenapp")
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.get_json()
            if not data or not data.get("tax_id"):
                return response_error("Datos inválidos o ID faltante")

            schema = TaxUpdateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Errores en validación: " + str(errors))
                return response_error("Errores en validación: " + str(errors))

            data["user_process"] = TokenComponent.User(token)
            result = AdminTaxComponent.UpdateTax(data)
            if result["result"]:
                return response_success("Impuesto actualizado correctamente")
            return response_error(result["message"])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminTaxService_Delete(Resource):
    @staticmethod
    def delete(tax_id):
        try:
            token = request.headers.get("tokenapp")
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            user = TokenComponent.User(token)
            result = AdminTaxComponent.DeleteTax(tax_id, user)
            if result["result"]:
                return response_success(result["message"])
            return response_not_found(result["message"])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))
