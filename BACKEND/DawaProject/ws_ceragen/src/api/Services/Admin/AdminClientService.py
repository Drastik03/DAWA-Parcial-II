from flask_restful import Resource
from flask import request

from ...Model.Request.Admin.ClientRequest import ClientCreateRequest, ClientUpdateRequest
from ....utils.general.logs import HandleLogs
from ....utils.general.response import (
    response_success,
    response_not_found,
    response_error,
    response_unauthorize
)

from ...Components.Security.TokenComponent import TokenComponent
from ...Components.Admin.AdminClientComponent import AdminClientComponent
class AdminClientService_GetAll(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Listado de clientes")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = AdminClientComponent.ListAllClients()
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

            schema = ClientCreateRequest()
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


class AdminClientService_GetById(Resource):
    @staticmethod
    def get(cli_id):
        try:
            HandleLogs.write_log(f"Consulta de cliente por ID {cli_id}")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = AdminClientComponent.GetClientById(cli_id)
            return response_success(res) if res and res["data"] else response_not_found()
        except Exception as err:
            HandleLogs.write_error(str(err))
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

            schema = ClientCreateRequest()
            HandleLogs.write_error("DESDE CLIENT SERVICE SCHEMA " + str(schema))

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


class AdminClientServiceUpdate(Resource):
    @staticmethod
    def patch():
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.get_json()
            HandleLogs.write_error("DESDE CLIENT SERVICE"+str(data))

            if not data or not data.get("cli_id"):
                return response_error("Datos inválidos o ID faltante")

            schema = ClientUpdateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Errores en validación: " + str(errors))
                return response_error("Errores en validación: " + str(errors))

            data["user_process"] = TokenComponent.User(token)
            result = AdminClientComponent.UpdateClient(data)
            HandleLogs.write_error("DESDE CLIENT SERVICE " + str(result))

            if result["result"]:
                return response_success("Cliente actualizado correctamente")
            return response_error(result["message"])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminClientServiceDelete(Resource):
    @staticmethod
    def delete(cli_id):
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            user = TokenComponent.User(token)
            result, message = AdminClientComponent.DeleteClient(cli_id, user)
            if result:
                return response_success(message)
            return response_not_found(message)

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))