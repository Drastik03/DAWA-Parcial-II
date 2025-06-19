from ....utils.general.logs import HandleLogs
from flask import request
from flask_restful import Resource
from ....utils.general.response import response_error, response_success, response_unauthorize
from ....api.Components.Security.TokenComponent import TokenComponent
from ....api.Model.Request.Security.LogoutRequest import LogoutRequestSchema
from ....api.Components.Security.LogoutComponent import LogoutComponent


class LogoutService(Resource):
    @staticmethod
    def patch():
        try:
            HandleLogs.write_log('cerrando')
            rq_json = request.get_json()
            new_request = LogoutRequestSchema()
            error = new_request.validate(rq_json)
            if error:
                HandleLogs.write_error("Error al Validar el Request -> " + str(error))
                return response_error("Error al Validar el Request -> " + str(error))

            answer = LogoutComponent.Logoutupdate(rq_json['logId'])
            if answer['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())
