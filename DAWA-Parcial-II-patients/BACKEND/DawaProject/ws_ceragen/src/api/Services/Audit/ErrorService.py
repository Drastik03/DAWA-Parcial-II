from flask import request
from flask_restful import Resource
from ....utils.general.logs import HandleLogs
from ....utils.general.response import response_success, response_error, response_not_found, response_unauthorize
from ....api.Components.Security.TokenComponent import TokenComponent
from ....api.Components.Audit.ErrorComponent import ErrorComponent
class ErrorService(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Audit Error System")
            token = request.headers['tokenapp']
            if token is None:
                return response_error("Error: No se ha podido Obtener el Token")
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()
            answer = ErrorComponent.read_logs()

            if answer is not None:
                return response_success(answer)
            else:
                return response_error('Error no es posible obtener la informacion  Solicitada')
        except Exception as err:
                HandleLogs.write_error(err)
                return response_error(err.__str__())
