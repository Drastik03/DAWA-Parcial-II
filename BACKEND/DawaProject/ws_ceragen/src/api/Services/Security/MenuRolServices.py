from flask import request
from flask_restful import Resource
from ....api.Model.Request.Security.InsertMenu import InsertMenuSchema
from ....utils.general.logs import HandleLogs
from ....utils.general.response import response_success, response_error, response_not_found, \
    response_unauthorize, response_inserted
from ....api.Components.Security.TokenComponent import TokenComponent
from ....api.Components.Security.MenuRolComponent import MenuRolComponent
from ....api.Model.Request.Security.InsertMenuRol import InsertMenuRolSchema
from ....api.Model.Request.Security.UpdateMenuRol import UpdateMenuRolSchema
from ....api.Model.Request.Security.DeleteService import DeleteServiceSchema


class MenuRolService(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Listado de Roles y Menus")
            # Obtengo el token
            token = request.headers['tokenapp']
            if token is None:
                return response_error("Error: No se ha podido Obtener el Token")

            # Validar el Token
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()

            # LLamar al metodo del componente
            answer = MenuRolComponent.MenuRolList()
            if answer['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())


class InsertMenuRol(Resource):
    @staticmethod
    def post():
        try:
            HandleLogs.write_log("Insertar Roles y Menus")
            token = request.headers['tokenapp']
            rq_json = request.get_json()
            new_request = InsertMenuRolSchema()
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

            answer = MenuRolComponent.MenuRolInsert(rq_json['menu_id'], rq_json['rol_id'], user_name)
            if answer['result'] is True:
                return response_inserted(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())


class DeleteMenuRol(Resource):
    @staticmethod
    def patch():
        try:
            HandleLogs.write_log("Eliminar Roles y Menus")
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
            answer = MenuRolComponent.MenuRolDelete(rq_json['del_id'], user_name)
            if answer['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())


class UpdateMenuRol(Resource):
    @staticmethod
    def patch():
        try:
            HandleLogs.write_log("Editar Roles y Menus")
            token = request.headers['tokenapp']
            rq_json = request.get_json()
            new_request = UpdateMenuRolSchema()
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
            answer = MenuRolComponent.MenuRolUpdate(rq_json['registro_id'], rq_json['rol_id'], rq_json['menu_id'], user_name)
            if answer['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())

