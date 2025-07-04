
from flask_restful import Resource
from ...Components.Patients.ClinicSessionComponent import ClinicSessionComponent
from ...Components.Security.NotificationComponent import NotificationComponent
from ....utils.general.logs import HandleLogs
from flask import request
from ....utils.general.response import (
    response_success,
    response_not_found,
    response_error,
    response_unauthorize
)
from ...Model.Request.Patients.ClinicSessionRequest import ClinicSessionInsertRequest, ClinicSessionUpdateRequest
from ...Components.Security.TokenComponent import TokenComponent

#ESTE METODO SE REPITA - ESTA FUERA DEL PROYECTO
class ClinicSessionService_GetAll(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Listado de sesiones clínicas")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = ClinicSessionComponent.getAllSessions()
            if res:
                return response_success(res)
            else:
                return response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class ClinicSessionService_GetById(Resource):
    @staticmethod
    def get(cli_id):
        try:
            HandleLogs.write_log(f"Obtener sesión clínica por ID: {cli_id}")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = ClinicSessionComponent.getSessionById(cli_id)
            return response_success(res) if res else response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class ClinicSessionService_Add(Resource):
    @staticmethod
    def post():
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.get_json()
            if not data:
                return response_error("Error en los datos para procesar")

            user = TokenComponent.User(token)
            data['user_created'] = user

            schema = ClinicSessionInsertRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Error al validar el request -> " + str(errors))
                return response_error("Error al validar el request -> " + str(errors))

            result = ClinicSessionComponent.createSession(data)
            if result["result"]:
                sec_id = result['data']['sec_id']
                NotificationComponent.NotificationSend(
                    {
                        "sun_user_source_id": user,
                        "sun_user_destination_id": data.get("sec_med_staff_id"),
                        "sun_title_notification": "Nueva sesión de control registrada",
                        "sun_text_notification": f"Sesión #{data.get('sec_ses_number')} programada para el {data.get('sec_ses_agend_date')}.",
                        "sun_state_notification": True,
                        "sun_isread_notification": False,
                        "user_created": data.get("user_created")
                    }
                )
                return response_success("Id de Registro -> " + str(result['data']['cli_id']))
            return response_error(result['message'])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class ClinicSessionService_Update(Resource):
    @staticmethod
    def patch():
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.get_json()
            if not data:
                return response_error("Error en los datos para procesar")

            schema = ClinicSessionUpdateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Error al validar el request -> " + str(errors))
                return response_error("Error al validar el request -> " + str(errors))

            cli_id = data.get('cli_id')
            result = ClinicSessionComponent.updateSession(cli_id, data)
            if result['result']:
                return response_success(data)
            return response_error(result['message'])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class ClinicSessionService_Delete(Resource):
    @staticmethod
    def delete(cli_id):
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            user = TokenComponent.User(token)
            result = ClinicSessionComponent.deleteSession(cli_id, user)
            return result
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))