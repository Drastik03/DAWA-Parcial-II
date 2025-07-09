from flask_restful import Resource
from ...Components.Patients.MedicalHistoryComponent import MedicalHistoryComponent
from ....utils.general.logs import HandleLogs
from ....utils.general.response import response_error, response_success, response_not_found, response_unauthorize, internal_response
from ...Components.Security.TokenComponent import TokenComponent
from flask import request
from datetime import datetime
from marshmallow import ValidationError
from ...Model.Request.Patients.MedicalHistoryRequest import MedicalHistoryInsertRequest, MedicalHistoryUpdateRequest
from ...Model.Response.Patients.MedicalHistoryResponse import MedicalHistoryResponse


class MedicalHistoryListService(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Ejecutando servicio de Listar Historiales Médicos")

            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado.")

            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            resultado = MedicalHistoryComponent.getAllMedicalHistories()

            if resultado:
                return response_success(resultado)
            else:
                HandleLogs.write_log("No hay historiales médicos disponibles o error en el componente.")
                return response_not_found() # Sin argumentos aquí

        except Exception as err:
            HandleLogs.write_error(f"Error inesperado en MedicalHistoryListService (GET): {str(err)}")
            return response_error("Error interno del servidor al listar historiales médicos")

class MedicalHistoryGetByIdService(Resource):
    """
    Servicio para obtener un historial médico por su ID.
    Corresponde a GET /medical-histories/list/<hist_id>
    """
    @staticmethod
    def get(hist_id):
        try:
            HandleLogs.write_log(f"Ejecutando servicio de Obtener Historial Médico por ID: {hist_id}")


            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado.")

            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            resultado = MedicalHistoryComponent.getAllMedicalHistories()

            if resultado:

                return response_success(resultado)
            else:
                HandleLogs.write_log(f"Historial médico con ID {hist_id} no encontrado.")
                return response_not_found()  # Sin argumentos aquí

        except Exception as err:
            HandleLogs.write_error(f"Error inesperado en MedicalHistoryGetByIdService (GET por ID): {str(err)}")
            return response_error("Error interno del servidor al obtener historial médico")

class MedicalHistoryInsertService(Resource):
    """
    Servicio para insertar un nuevo historial médico.
    Corresponde a POST /medical-histories/insert
    """
    @staticmethod
    def post():
        try:
            HandleLogs.write_log("Ejecutando servicio de Insertar Historial Médico")

            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado.")

            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.get_json()
            if not data:
                return response_error("No se proporcionaron datos en la petición.")

            try:
                validated_data = MedicalHistoryInsertRequest().load(data)
            except ValidationError as err:
                return response_error(f"Error de validación: {err.messages}")

            user_created = TokenComponent.User(token)
            validated_data['user_created'] = user_created

            result = MedicalHistoryComponent.insertMedicalHistory(validated_data)

            if result.get("result"):
                new_hist_id = result.get('data')
                return internal_response(True, "Historial médico insertado exitosamente", {'hist_id': new_hist_id})
            else:
                return response_error(result.get("message"))

        except Exception as err:
            HandleLogs.write_error(f"Error inesperado en MedicalHistoryInsertService (POST): {str(err)}")
            return response_error("Error interno del servidor al insertar historial médico")

class MedicalHistoryUpdateService(Resource):
    """
    Servicio para actualizar parcialmente un historial médico existente.
    Corresponde a PATCH /medical-histories/update/<hist_id>
    """
    @staticmethod
    def patch(hist_id):
        try:
            HandleLogs.write_log(f"Ejecutando servicio de Actualizar Historial Médico (parcial) para ID: {hist_id}")

            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado.")

            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.get_json()
            if not data:
                return response_error("No se proporcionaron datos en la petición para actualizar.")

            data['hist_id'] = hist_id

            try:
                validated_data = MedicalHistoryUpdateRequest().load(data)
            except ValidationError as err:
                return response_error(f"Error de validación: {err.messages}")

            user_modified = TokenComponent.User(token)
            validated_data['user_modified'] = user_modified
            validated_data['date_modified'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            result = MedicalHistoryComponent.updateMedicalHistory(hist_id, validated_data)

            if result.get("result"):
                return response_success("Historial médico actualizado exitosamente.")
            else:
                return response_error(result.get("message"))

        except Exception as err:
            HandleLogs.write_error(f"Error inesperado en MedicalHistoryUpdateService (PATCH): {str(err)}")
            return response_error("Error interno del servidor al actualizar historial médico")

class MedicalHistoryDeleteService(Resource):
    """
    Servicio para eliminar (borrado lógico) un historial médico.
    Corresponde a DELETE /medical-histories/delete/<hist_id>
    """
    @staticmethod
    def delete(hist_id):
        try:
            HandleLogs.write_log(f"Ejecutando servicio de Eliminar Historial Médico para ID: {hist_id}")

            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado.")

            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            user_deleted = TokenComponent.User(token)

            result = MedicalHistoryComponent.deleteMedicalHistory(hist_id, user_deleted)

            if result.get("result"):
                return response_success(result.get("message", "Historial médico eliminado correctamente."))
            else:
                message = result.get("message")
                # Si el componente devuelve un mensaje de "no encontrado", usamos response_not_found sin argumentos
                if "no encontrado" in message.lower():
                    return response_not_found() # Sin argumentos aquí
                return response_error(message)

        except Exception as err:
            HandleLogs.write_error(f"Error inesperado en MedicalHistoryDeleteService (DELETE): {str(err)}")
            return response_error("Error interno del servidor al eliminar historial médico")

class MedicalHistoryListByPatientIdService(Resource):
    """
    Servicio para obtener todos los historiales médicos de un paciente específico.
    Corresponde a GET /medical-histories/patient/<patient_id>
    """
    @staticmethod
    def get(hist_patient_id):
        try:
            HandleLogs.write_log(f"Ejecutando servicio de Listar Historiales Médicos por Patient ID: {hist_patient_id}")

            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado.")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()
            result = MedicalHistoryComponent.getMedicalHistoriesByPatientId(hist_patient_id)
            if result.get("result"):
                if result.get("data"):
                    return response_success(result.get("data"))
                else:
                    return response_not_found()
            else:
                return response_error(result.get("message"))
        except Exception as err:
            HandleLogs.write_error(f"Error inesperado en MedicalHistoryListByPatientIdService (GET): {str(err)}")
            return response_error("Error interno del servidor al listar historiales médicos por paciente")

