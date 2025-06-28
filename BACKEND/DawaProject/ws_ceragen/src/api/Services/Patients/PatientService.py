from flask_restful import Resource
from flask import request, jsonify
from ....utils.general.logs import HandleLogs
from ....utils.general.response import (response_success, response_not_found, response_error, response_unauthorize)
from ...Components.Patients.PatientComponent import PatientComponent
from ...Model.Request.Patients.PatientRequest import PatientInsertRequest, PatientUpdateRequest
from ...Components.Security.TokenComponent import TokenComponent
from ....utils.database.connection_db import DataBaseHandle


class PatientListService(Resource):
    @staticmethod
    def get():
        """
        Servicio para listar todos los pacientes activos.
        """
        try:
            HandleLogs.write_log("Listado de Pacientes")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido Obtener el Token")

            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()

            res = PatientComponent.getAllPatients()
            if res:
                return response_success(res)
            else:
                return response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(f"Error inesperado al listar pacientes: {str(err)}")


class PatientGetByIdService(Resource):
    @staticmethod
    def get(patient_id=None):  # Añadir patient_id como parámetro opcional para la misma ruta
        """
            Obtiene un paciente por su ID (pat_id) desde la base de datos.
            """
        try:
            HandleLogs.write_log(f"Obteniendo paciente con ID: {patient_id} desde la DB (PatientComponent).")

            sql = """
                    SELECT
                        pat_id,
                        pat_person_id,
                        pat_client_id,
                        pat_code,
                        pat_medical_conditions,
                        pat_allergies,
                        pat_blood_type,
                        pat_emergency_contact_name,
                        pat_emergency_contact_phone,
                        pat_state,
                        user_created,
                        date_created,
                        user_modified,
                        date_modified,
                        user_deleted,
                        date_deleted
                    FROM ceragen.admin_patient
                    WHERE pat_id = %s AND pat_state = true;
                """
            params_tuple = (patient_id,)
            result_db = DataBaseHandle.getRecords(sql, 1, params_tuple)

            if result_db and result_db.get('result'):
                if result_db.get('data'):
                    return response_success(result_db.get('data'))  # ✅ solo 1 argumento
                else:
                    return response_not_found()
            else:
                mensaje = result_db.get('message', "Error al obtener paciente: desconocido")
                HandleLogs.write_error(mensaje)
                return response_error(mensaje)

        except Exception as err:
            error_msg = f"Error inesperado en PatientComponent.getPatientById: {str(err)}"
            HandleLogs.write_error(error_msg)
            return response_error(f"Error interno del servidor al obtener paciente: {str(err)}")


class PatientInsertService(Resource):
    @staticmethod
    def post():
        """
        Servicio para insertar un nuevo paciente.
        """
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido Obtener el Token")

            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()

            data_to_insert = request.get_json()
            if not data_to_insert:
                return response_error("Error: No se han proporcionado datos para procesar.")

            # Validar el Request con Marshmallow schema
            schema = PatientInsertRequest()
            errors = schema.validate(data_to_insert)
            if errors:
                HandleLogs.write_error(f"Error de validación al insertar paciente: {errors}")
                return response_error(f"Error en los datos de entrada: {errors}")

            if 'user_process' not in data_to_insert:
                user_token_id = TokenComponent.User(
                    token)
                data_to_insert['user_process'] = user_token_id if user_token_id else 'UNKNOWN_USER'

            result = PatientComponent.createPatient(data_to_insert)

            if result['result']:
                return response_success(f"Paciente creado exitosamente con ID: {result['data']}")
            else:
                return response_error(result['message'])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(f"Error inesperado al crear paciente: {str(err)}")


class PatientUpdateService(Resource):
    @staticmethod
    def patch():
        """
        Servicio para actualizar un paciente existente.
        """
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido Obtener el Token")

            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()

            data_to_update = request.get_json()
            if not data_to_update:
                return response_error("Error: No se han proporcionado datos para procesar.")

            # Validar el Request con Marshmallow schema
            schema = PatientUpdateRequest()
            errors = schema.validate(data_to_update)
            if errors:
                HandleLogs.write_error(f"Error de validación al actualizar paciente: {errors}")
                return response_error(f"Error en los datos de entrada: {errors}")

            patient_id = data_to_update.get('patient_id')
            if not patient_id:
                return response_error("Error: 'patient_id' es requerido para la actualización.")

            if 'user_process' not in data_to_update:
                user_token_id = TokenComponent.User(token)
                data_to_update['user_process'] = user_token_id if user_token_id else 'UNKNOWN_USER'

            result = PatientComponent.updatePatient(patient_id, data_to_update)

            if result['result']:
                rows_affected = result['data']
                if rows_affected > 0:
                    return response_success(
                        f"Paciente con ID {patient_id} actualizado exitosamente. Filas afectadas: {rows_affected}")
                else:
                    return response_not_found(f"Paciente con ID {patient_id} no encontrado o no hubo cambios.")
            else:
                return response_error(result['message'])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(f"Error inesperado al actualizar paciente: {str(err)}")


class PatientDeleteService(Resource):
    @staticmethod
    def delete(patient_id: int, user: str):
        """
        Servicio para eliminar lógicamente un paciente por su ID.
        """
        try:
            HandleLogs.write_log(f"Eliminar paciente por ID: {patient_id} por el usuario: {user}")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido Obtener el Token")

            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()

            user_from_token = TokenComponent.User(token)
            if user_from_token != user:
                HandleLogs.write_error(
                    f"Alerta de seguridad: Usuario '{user}' en URL no coincide con usuario del token '{user_from_token}'.")

                return response_error(
                    "Acción no permitida: el usuario en la URL no coincide con el usuario autenticado.")

            result = PatientComponent.deletePatient(patient_id, user)

            if result['result']:
                rows_affected = result['data']
                if rows_affected > 0:
                    return response_success(f"Paciente con ID {patient_id} desactivado exitosamente.")
                else:
                    return response_not_found(f"Paciente con ID {patient_id} no encontrado o ya inactivo.")
            else:
                return response_error(result['message'])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(f"Error inesperado al eliminar paciente: {str(err)}")