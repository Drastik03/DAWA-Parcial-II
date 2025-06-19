from flask import request
from flask_restful import Resource
from ....api.Components.Security.TokenComponent import TokenComponent
from ....utils.general.logs import HandleLogs
from ....utils.general.response import response_success, response_error, response_not_found,response_inserted
from ....utils.general.response import response_unauthorize
from ....api.Components.Security.NotificationComponent import NotificationComponent
from ....api.Model.Request.Security.NotificationIsReadRequest import NotificationIsReadRequest
from ....api.Model.Request.Security.DeleteService import DeleteServiceSchema
class NotificationService(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Notificaciones")
            # Obtengo el token
            token = request.headers['tokenapp']
            HandleLogs.write_log("El token es: " + str(token))
            if token is None:
                return response_error("Error: No se ha podido Obtener el Token")

            # Validar el Token
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()
            user_toker = TokenComponent.User(token)

            # LLamar al metodo del componente
            answer = NotificationComponent.NotificationsList(user_toker)
            if answer['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())


class NotificationRead(Resource):
    @staticmethod
    def patch():
        try:
            HandleLogs.write_log("Notification is Read")
            rq_json = request.get_json()
            new_request = NotificationIsReadRequest()
            error = new_request.validate(rq_json)
            if error:
                HandleLogs.write_error("Error al Validar el Request -> " + str(error))
                return response_error("Error al Validar el Request -> " + str(error))
            token = request.headers['tokenapp']
            if token is None:
                return response_error("Error: No se ha podido Obtener el Token")
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()
            user_name = TokenComponent.User(token)
            answer = NotificationComponent.NotificationsIsRead(rq_json['notification_read'], user_name, rq_json['notification_id'])
            HandleLogs.write_log(answer)
            if answer['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())

class NotificationDelete(Resource):
    @staticmethod
    def patch():
        try:
            HandleLogs.write_log("Notification is Read")

            rq_json = request.get_json()
            new_request = DeleteServiceSchema()
            error = new_request.validate(rq_json)
            if error:
                HandleLogs.write_error("Error al Validar el Request -> " + str(error))
                return response_error("Error al Validar el Request -> " + str(error))
            token = request.headers['tokenapp']
            if token is None:
                return response_error("Error: No se ha podido Obtener el Token")
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()
            user_name = TokenComponent.User(token)
            answer = NotificationComponent.NotificationDelete(rq_json['del_id'], user_name)
            HandleLogs.write_log(answer)
            if answer['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())

