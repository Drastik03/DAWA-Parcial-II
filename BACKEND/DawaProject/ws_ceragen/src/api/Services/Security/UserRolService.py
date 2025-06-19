from flask import request
from flask_restful import Resource

from ....api.Model.Request.Security.DeleteService import DeleteServiceSchema
from ....utils.general.logs import HandleLogs
from ....api.Components.Security.TokenComponent import TokenComponent
from ....utils.general.response import response_success, response_error, response_inserted, response_unauthorize
from ....api.Components.Security.UserRolComponent import UserRolComponent
from ....api.Model.Request.Security.InsertRolUser import InsertRolUserSchema
from ....api.Model.Request.Security.UpdateRolUser import UpdateUserRolSchema


class UserRolService(Resource):

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
            answer = UserRolComponent.UserRolList()
            if answer['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())
class DeleteUserRol(Resource):
    @staticmethod
    def patch():
        try:
            HandleLogs.write_log("Eliminar UserRol")
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
            answer = UserRolComponent.UserRolDelete(rq_json['del_id'], user_name)
            if answer['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())

class InsertUserRol(Resource):
    @staticmethod
    def post():
            try:
                HandleLogs.write_log("Asignar Rol a Usuario")
                token = request.headers['tokenapp']
                rq_json = request.get_json()
                new_request = InsertRolUserSchema()
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

                answer = UserRolComponent.UserRolInsert(rq_json['id_rol'],
                                                  rq_json['id_user'],
                                                  rq_json['id_career_period'],
                                                  user_name)

                if answer['result'] is True:
                    return response_inserted(answer['data'])
                else:
                    return response_error(answer['message'])
            except Exception as err:
                HandleLogs.write_error(err)
                return response_error(err.__str__())


class UpdateUserRol(Resource):
    @staticmethod
    def patch():
        try:
            HandleLogs.write_log("Actualizar UserRol")
            token = request.headers['tokenapp']
            rq_json = request.get_json()
            new_request = UpdateUserRolSchema()
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
            answer = UserRolComponent.UserRolUpdate(rq_json['id_user_rol'],rq_json['id_rol'],rq_json['id_user'],user_name)
            if answer['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())
