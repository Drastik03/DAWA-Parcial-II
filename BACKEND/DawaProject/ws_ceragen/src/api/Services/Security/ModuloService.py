from flask import request
from flask_restful import Resource
from ....api.Components.Security.TokenComponent import TokenComponent
from ....utils.general.logs import HandleLogs
from ....utils.general.response import response_success, response_error, response_not_found,response_inserted
from ....utils.general.response import response_unauthorize
from ....api.Components.Security.ModuloComponent import ModuleComponent
from ....api.Model.Request.Security.UpdateModulo import UpdateModuloSchema
from ....api.Model.Request.Security.InsertModulo import InsertModuloSchema
from ....api.Model.Request.Security.DeleteService import DeleteServiceSchema
class ModuleService(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Listado Modulos")
            # Obtengo el token
            token = request.headers['tokenapp']
            HandleLogs.write_log(token)
            if token is None:
                return response_error("Error: No se ha podido Obtener el Token")

            # Validar el Token
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()

            # LLamar al metodo del componente
            answer = ModuleComponent.ModuleList()
            HandleLogs.write_log(answer['data'])
            if answer['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())


class InsertModulo(Resource):
    @staticmethod
    def post():
        try:
            HandleLogs.write_log("Insertar Modulo")
            token = request.headers['tokenapp']
            rq_json = request.get_json()
            new_request = InsertModuloSchema()
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
            answer = ModuleComponent.ModuleInsert(rq_json['mod_name'], rq_json['mod_description'], rq_json['mod_order'],
                                             rq_json['mod_icon_name'], user_name)
            if answer['result'] is True:
                return response_inserted(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())

class DeleteModulo(Resource):
    @staticmethod
    def patch():
        try:
            HandleLogs.write_log("Eliminar Modulo")
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
            answer = ModuleComponent.ModuleDelete(rq_json['del_id'],user_name)
            if answer['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())

class UpdateModulo(Resource):
    @staticmethod
    def patch():
        try:
            HandleLogs.write_log("Editar Modulo")
            token = request.headers['tokenapp']
            rq_json = request.get_json()
            new_request = UpdateModuloSchema()
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
            answer = ModuleComponent.ModuleUpdate(rq_json['mod_name'],rq_json['mod_description'],rq_json['mod_order'],rq_json['mod_icon_name'],user_name, rq_json['mod_id'])
            if answer['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())