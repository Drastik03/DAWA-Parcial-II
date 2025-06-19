from ....utils.general.logs import HandleLogs
from ....utils.general.config import Parametros
import pytz
import jwt
from datetime import datetime, timedelta
import base64
from flask import make_response
class TokenComponent:

    @staticmethod
    def Token_Generate(p_user):
        try:
            respuesta = None
            timezone = pytz.timezone('America/Guayaquil')
            payload = {
                'iat': datetime.now(tz=timezone),
                'exp': datetime.now(tz=timezone) + timedelta(minutes=120),
                'username': p_user

            }
            respuesta = jwt.encode(payload, Parametros.secret_jwt, algorithm="HS256")
        except Exception as err:
            HandleLogs.write_error(err)
        finally:
            return respuesta



    @staticmethod
    def Token_Validate(token):
        try:
            respuesta = False

            payload = jwt.decode(token, Parametros.secret_jwt, algorithms=['HS256'])
            print(payload)
            print(payload['username'])
            respuesta = True
        except jwt.ExpiredSignatureError:
            HandleLogs.write_error("Expired Signature")
        except Exception as err:
            HandleLogs.write_error(str(err))
        finally:
            return respuesta

    @staticmethod
    def User(token):
        payload = jwt.decode(token, Parametros.secret_jwt, algorithms=['HS256'])
        print(payload['username'])
        return payload['username']

    @staticmethod
    def Token_Generate_ResetPassword(user_login_id):

        try:
            respuesta = None
            timezone = pytz.timezone('America/Guayaquil')
            payload = {

                'email': user_login_id,
                'iat': datetime.now(tz=timezone),
                'exp': datetime.now(tz=timezone) + timedelta(minutes=15)
            }
            # Generar el token
            respuesta = jwt.encode(payload, Parametros.secret_jwt, algorithm="HS256")
        except Exception as err:
            HandleLogs.write_error(err)
        finally:
            return respuesta


    @staticmethod
    def Token_Validate_ResetPassword(token):
        try:
            data = None
            decoded_token = base64.urlsafe_b64decode(token).decode("utf-8")
            payload = jwt.decode(decoded_token, Parametros.secret_jwt, algorithms=['HS256'])
            data = str(payload['email'])
        except Exception as err:
            HandleLogs.write_error(err)
        finally:
            return data
