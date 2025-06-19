from flask import request
from flask_restful import Resource
from ...Components.Security.TokenComponent import TokenComponent
from ...Model.Request.Security.UpdateRolSistem import UpdateRolSistemSchema
from ...Model.Request.Security.InsertRolSistem import InsertRolSistemSchema
from ....utils.general.logs import HandleLogs
from ....utils.general.response import response_success, response_error, response_not_found
from ....utils.general.response import response_unauthorize, response_inserted
from ...Components.Security.RolSistemComponent import RolSistemComponent
from ...Model.Request.Security.DeleteService import DeleteServiceSchema

class RolSistemService(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Listado de Roles y Modulos")
            # Obtengo el token
            token = request.headers['tokenapp']
            if token is None:
                return response_error("Error: No se ha podido Obtener el Token")

            # Validar el Token
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()

            # LLamar al metodo del componente
            answer = RolSistemComponent.RolSistemList()
            if answer['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())

class DeleteRolSistem(Resource):
    @staticmethod
    def patch():
        try:
            HandleLogs.write_log("Eliminar RolSistem")
            token = request.headers['tokenapp']
            rq_json = request.get_json()
            new_request = DeleteServiceSchema()
            error = new_request.validate(rq_json)
            if error:
                HandleLogs.write_error("Error al Validar el Request -> " + str(error))
                return response_error("Error al Validar el Request -> " + str(error))
            # LLamar al metodo del componente
            if token is None:
                return response_error("Error: No se ha podido Obtener el Token")

            # Validar el Token
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()
            user_name = TokenComponent.User(token)
            # LLamar al metodo del componente
            answer = RolSistemComponent.RolSistemDelete(rq_json['del_id'], user_name)
            if answer['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())

class UpdateRolSistem(Resource):
    @staticmethod
    def patch():
        try:
            HandleLogs.write_log("Editar Menu")
            token = request.headers['tokenapp']
            rq_json = request.get_json()
            new_request = UpdateRolSistemSchema()
            error = new_request.validate(rq_json)
            if error:
                HandleLogs.write_error("Error al Validar el Request -> " + str(error))
                return response_error("Error al Validar el Request -> " + str(error))
            # LLamar al metodo del componente
            if token is None:
                return response_error("Error: No se ha podido Obtener el Token")

            # Validar el Token
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()
            user_name = TokenComponent.User(token)
            # LLamar al metodo del componente
            answer = RolSistemComponent.RolSistemUpdate(rq_json['rol_name'],rq_json['rol_description'],user_name,rq_json['rol_id'])
            if answer['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())

class InsertRolSistem(Resource):
    @staticmethod
    def post():
        try:
            HandleLogs.write_log("Insert Rol")
            token = request.headers['tokenapp']
            rq_json = request.get_json()
            new_request = InsertRolSistemSchema()
            error = new_request.validate(rq_json)
            if error:
                HandleLogs.write_error("Error al Validar el Request -> " + str(error))
                return response_error("Error al Validar el Request -> " + str(error))
            # LLamar al metodo del componente
            if token is None:
                return response_error("Error: No se ha podido Obtener el Token")

            # Validar el Token
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()
            user_name = TokenComponent.User(token)
            # LLamar al metodo del componente
            answer = RolSistemComponent.RolSistemInsert(rq_json['rol_name'],rq_json['rol_description'],user_name)
            if answer['result'] is True:
                return response_inserted(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())