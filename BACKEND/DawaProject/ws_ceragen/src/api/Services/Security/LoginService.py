from ....utils.general.logs import HandleLogs
from ...Model.Request.Security.LoginRequest import LoginRequest
from flask import request
from flask_restful import Resource
from ....utils.general.response import response_error, response_success
from ...Components.Security.LoginComponent import LoginComponent
from ...Components.Security.TokenComponent import TokenComponent
from ...Components.Security.loginDataComponent import LoginDataComponent
from ...Components.Security.UserComponent import UserComponent

class LoginService(Resource):

    @staticmethod
    def post():
        try:
            HandleLogs.write_log("Ingreso a Validar el Login")
            # Obtengo el Request
            rq_json = request.get_json()
            user_ip = request.remote_addr
            #print(user_ip)
            #Validar ese Request con mi modelo
            HandleLogs.write_log("Validar  Request")
            new_request = LoginRequest()
            error = new_request.validate(rq_json)
            if error:
                HandleLogs.write_error("Error al Validar el Request -> " + str(error))
                return response_error("Error al Validar el Request -> " + str(error))
            #LLamar al metodo del componente
            HandleLogs.write_log("metodo del componente")
            resultado = LoginComponent.Login(rq_json['login_user'], rq_json['login_password'])
            #HandleLogs.write_log(resultado)
            if resultado['result']:
                #Generamos el Token de Respuesta
                token = TokenComponent.Token_Generate(rq_json['login_user'])
                if token is None:
                    return response_error("Error al Generar Token")
                else:

                    print(TokenComponent.Token_Validate(token))
                    result = LoginDataComponent.loginData(rq_json['login_user'],token, user_ip, rq_json['host_name'])
                    update_time_login = UserComponent.UserUpdate_time_login(rq_json['login_user'])
                    HandleLogs.write_log(update_time_login)
                    respuesta = {
                        'Token': token,
                        'Datos': resultado['data'],
                        'LogId': result['data']
                    }
                    return response_success(respuesta)
            else:
                return response_error(resultado['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())

