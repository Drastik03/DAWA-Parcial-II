from flask_restful import Resource
from ...Components.Patients.MedicalHistoryComponent import MedicalHistoryComponent
from ....utils.general.logs import HandleLogs
from ....utils.general.response import response_error, response_success, response_not_found, response_unauthorize, internal_response
from ...Components.Security.TokenComponent import TokenComponent
from flask import request




from ...Components.Patients.TherapySessionControlComponent import TherapySessionControlComponent
from ...Model.Request.Patients.TherapySessionControlRequest import (
    TherapySessionControlInsertRequest,
    TherapySessionControlUpdateRequest
)
from ...Model.Response.Patients.TherapySessionControlResponse import TherapySessionControlResponse

from ....utils.general.response import response_success, response_error, response_not_found, response_inserted
from ....utils.general.logs import HandleLogs


# --- LISTAR TODAS LAS SESIONES DE CONTROL DE TERAPIA ---
class TherapySessionControlListService(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Iniciando obtención de todas las sesiones de control de terapia.")
            result = TherapySessionControlComponent.getAllTherapySessionsControl()

            if result['result']:
                serialized_data = TherapySessionControlResponse(many=True).dump(result['data'])
                return response_success(serialized_data)
            else:
                if "no encontrada" in result['message'] or "no encontrado" in result['message']:
                    return response_not_found(result['message'])
                else:
                    return response_error(result['message'])

        except Exception as e:
            HandleLogs.write_error(f"Error al obtener todas las sesiones de control de terapia: {str(e)}")
            return response_error("Error interno del servidor al procesar la solicitud.")

# --- OBTENER SESIÓN DE CONTROL DE TERAPIA POR ID ---
class TherapySessionControlGetByIdService(Resource):
    @staticmethod
    def get(sec_id):
        try:
            HandleLogs.write_log(f"Iniciando obtención de sesión de control de terapia por ID: {sec_id}.")
            result = TherapySessionControlComponent.getTherapySessionControlById(sec_id)

            if result['result']:
                serialized_data = TherapySessionControlResponse().dump(result['data'])
                return response_success(serialized_data)
            else:
                if "no encontrada" in result['message'] or "no encontrado" in result['message']:
                    return response_not_found(result['message'])
                else:
                    return response_error(result['message'])

        except Exception as e:
            HandleLogs.write_error(f"Error al obtener sesión de control de terapia por ID {sec_id}: {str(e)}")
            return response_error("Error interno del servidor al procesar la solicitud.")

# --- AGREGAR NUEVA SESIÓN DE CONTROL DE TERAPIA ---
class TherapySessionControlAddService(Resource):
    @staticmethod
    def post():
        try:
            HandleLogs.write_log("Iniciando adición de nueva sesión de control de terapia.")

            data = request.get_json()
            if not data:
                return response_error("No se proporcionaron datos JSON en la solicitud.")

            schema = TherapySessionControlInsertRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error(f"Error de validación al agregar sesión de control de terapia: {errors}")
                return response_error("Error de validación: " + str(errors))

            result = TherapySessionControlComponent.createTherapySessionControl(data)

            if result['result']:
                return response_inserted(result['data'])
            else:
                return response_error(result['message'])

        except Exception as e:
            HandleLogs.write_error(f"Error al agregar sesión de control de terapia: {str(e)}")
            return response_error("Error interno del servidor al procesar la solicitud.")

# --- ACTUALIZAR SESIÓN DE CONTROL DE TERAPIA ---
class TherapySessionControlUpdateService(Resource):
    @staticmethod
    def patch(sec_id):
        try:
            HandleLogs.write_log(f"Iniciando actualización de sesión de control de terapia ID: {sec_id}.")

            data = request.get_json()
            if not data:
                return response_error("No se proporcionaron datos JSON en la solicitud para actualizar.")

            schema = TherapySessionControlUpdateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error(f"Error de validación al actualizar sesión de control de terapia: {errors}")
                return response_error("Error de validación: " + str(errors))

            if 'user_modified' not in data or not data['user_modified']:
                return response_error("Se requiere 'user_modified' para la actualización.")

            result = TherapySessionControlComponent.updateTherapySessionControl(sec_id, data)

            if result['result']:
                return response_success(result.get('data', {}))
            else:
                if "no encontrada" in result['message'] or "no encontrado" in result['message']:
                    return response_not_found()
                else:
                    return response_error(result['message'])

        except Exception as e:
            HandleLogs.write_error(f"Error al actualizar sesión de control de terapia ID {sec_id}: {str(e)}")
            return response_error("Error interno del servidor al procesar la solicitud.")




# --- ELIMINAR SESIÓN DE CONTROL DE TERAPIA (LÓGICA) ---
class TherapySessionControlDeleteService(Resource):
    @staticmethod
    def delete(sec_id):
        """
        Inactiva una sesión de control de terapia (soft delete).
        Requiere token en el header y lo usa para determinar el usuario que realiza la acción.
        """
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado.")

            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            user = TokenComponent.User(token)
            username = user.get("username") if isinstance(user, dict) else str(user)

            result = TherapySessionControlComponent.deleteTherapySessionControl(sec_id, username)
            return result

        except Exception as err:
            HandleLogs.write_error(f"Error en TherapySessionService_Delete: {str(err)}")
            return response_error("Error interno al eliminar la sesión de control.")