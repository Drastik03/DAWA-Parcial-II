from flask import request
from flask_restful import Resource

from ....api.Model.Request.Security.InsertMenu import InsertMenuSchema
from ....utils.general.logs import HandleLogs
from ....utils.general.response import response_success, response_error, response_not_found, response_unauthorize, response_inserted
from ....api.Components.Security.TokenComponent import TokenComponent
from ....api.Components.Security.ComponentMenu import ComponentMenu
from ....api.Model.Request.Security.DeleteService import DeleteServiceSchema
from ....api.Model.Request.Security.UpdateMenu import UpdateMenuSchema
class MenuService(Resource):
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
            answer = ComponentMenu.MenuList()
            if answer['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
                HandleLogs.write_error(err)
                return response_error(err.__str__())

class InsertMenu(Resource):
    @staticmethod
    def post():
        try:
            HandleLogs.write_log("Insertar Modulo")
            token = request.headers['tokenapp']
            rq_json = request.get_json()
            new_request = InsertMenuSchema()
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

            answer = ComponentMenu.MenuInsert(rq_json['menu_name'],rq_json['menu_order'],rq_json['menu_module_id'],rq_json['menu_parent_id'],rq_json['menu_icon_name'],rq_json['menu_href'],rq_json['menu_url'], user_name)
            if answer['result'] is True:
                return response_inserted(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())


class DeleteMenu(Resource):
    @staticmethod
    def patch():
        try:
            HandleLogs.write_log("Eliminar Menu")
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
            answer = ComponentMenu.MenuDelete(rq_json['del_id'], user_name)
            if answer['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())


class UpdateMenu(Resource):
    @staticmethod
    def patch():
        try:
            HandleLogs.write_log("Editar Menu")
            token = request.headers['tokenapp']
            rq_json = request.get_json()
            new_request = UpdateMenuSchema()
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
            answer = ComponentMenu.MenuUpdate(rq_json['menu_name'],rq_json['menu_order'],rq_json['menu_module_id'],rq_json['menu_parent_id'],rq_json['menu_icon_name'],rq_json['menu_href'],rq_json['menu_url'], user_name, rq_json['menu_id'])
            if answer ['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())