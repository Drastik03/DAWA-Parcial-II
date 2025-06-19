from flask import request
from flask_restful import Resource

from ....api.Components.Security.TokenComponent import TokenComponent
from ....utils.general.logs import HandleLogs
from ....utils.general.response import response_success, response_error, response_not_found,response_inserted
from ....utils.general.response import response_unauthorize
from ....api.Components.Security.GetPersonComponent import GetPersonComponent

class GetPersonService(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Obtener datos de una Persona")

            token = request.headers['tokenapp']
            if token is None:
                return response_error("Error: No se ha podido Obtener el Token")

            # Validar el Token
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()
            # LLamar al metodo del componente
            answer = GetPersonComponent.PersonDate()
            HandleLogs.write_log(answer['data'])
            if answer['result'] is True:
                if not answer['data']:
                    return response_not_found()
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())