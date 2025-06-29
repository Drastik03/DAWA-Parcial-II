from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.logs import HandleLogs
from ....utils.general.response import internal_response,response_success, response_error, response_not_found

from datetime import datetime


class PatientComponent:
    """
    Componente de lógica de negocio para la gestión de pacientes.
    Realiza operaciones CRUD directas con la base de datos.
    """

    @staticmethod
    def getAllPatients():
        """
        Obtiene todos los pacientes activos de la base de datos.
        """
        try:
            HandleLogs.write_log("Obteniendo todos los pacientes desde la DB (PatientComponent).")
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
                to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created,
                to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') as date_modified,
                user_created,
                user_modified,
                user_deleted,
                date_deleted
                FROM ceragen.admin_patient
                WHERE pat_state = TRUE;
            """
            result_db = DataBaseHandle.getRecords(sql, 0)

            if result_db and result_db.get('result'):
                return result_db.get('data')
            else:
                HandleLogs.write_error(
                    f"Error o no hay datos al obtener todos los pacientes: {result_db.get('message', 'Desconocido')}")
                return None

        except Exception as err:
            HandleLogs.write_error(f"Error inesperado en PatientComponent.getAllPatients: {str(err)}")
            return None

    @staticmethod
    def getPatientById(pat_id: int):
        """
        Obtiene un paciente por su ID desde la base de datos.
        """
        try:
            HandleLogs.write_log(f"Obteniendo paciente con ID {pat_id} desde la DB (PatientComponent).")
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
                    to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created,
                    to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') as date_modified,
                    user_created,
                    user_modified,
                    user_deleted,
                    date_deleted
                FROM ceragen.admin_patient
                WHERE pat_id = %s AND pat_state = TRUE;
            """
            result_db = DataBaseHandle.getRecords(sql, 1, (pat_id,))

            if result_db and result_db.get('result'):
                return result_db.get('data')
            else:
                HandleLogs.write_error(
                    f"No se encontró el paciente con ID {pat_id}: {result_db.get('message', 'Desconocido')}")
                return None

        except Exception as err:
            HandleLogs.write_error(f"Error inesperado en PatientComponent.getPatientById: {str(err)}")
            return None

    @staticmethod
    def createPatient(data: dict):
        """
        Crea un nuevo paciente en la base de datos.
        """
        try:
            HandleLogs.write_log(f"Creando paciente en la DB (PatientComponent). Datos: {data}")

            sql = """
                INSERT INTO ceragen.admin_patient (
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
                    date_created
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, TRUE, %s, NOW())
                RETURNING pat_id;
            """
            params = (
                data.get('pat_person_id'),
                data.get('pat_client_id'),
                data.get('pat_code', ''),
                data.get('pat_medical_conditions', ''),
                data.get('pat_allergies', ''),
                data.get('pat_blood_type'),
                data.get('pat_emergency_contact_name'),
                data.get('pat_emergency_contact_phone'),
                data.get('user_created')
            )

            result_db = DataBaseHandle.ExecuteInsert(sql, params)

            if result_db.get("result"):
                new_id = result_db["data"][0].get("pat_id") if result_db.get("data") else None
                return internal_response(True, "Paciente creado exitosamente", {"pat_id": new_id})
            else:
                return internal_response(False, result_db.get("message", "Error desconocido"), None)

        except Exception as e:
            HandleLogs.write_error(f"Error inesperado en PatientComponent.createPatient: {str(e)}")
            return internal_response(False, "Error interno del servidor al crear paciente", None)

    @staticmethod
    def updatePatient(pat_id: int, data: dict):
        """
        Actualiza un paciente existente en la base de datos.
        """
        try:
            HandleLogs.write_log(f"Actualizando paciente ID {pat_id} con datos: {data}")

            # Validar que user_modified esté presente para auditoría
            if not data.get('user_modified'):
                return internal_response(False, "El usuario que modifica es requerido", None)

            # Validar que el paciente exista
            sql_check = "SELECT 1 FROM ceragen.admin_patient WHERE pat_id = %s AND pat_state = TRUE"
            exists = DataBaseHandle.getRecords(sql_check, 1, (pat_id,))
            if not exists or not exists.get('result') or not exists.get('data'):
                return internal_response(False, f"Paciente con ID {pat_id} no encontrado", None)

            # Construir SQL para update con los campos permitidos (puedes ajustar según necesidades)
            sql = """
                UPDATE ceragen.admin_patient
                SET
                    pat_person_id = %s,
                    pat_client_id = %s,
                    pat_code = %s,
                    pat_medical_conditions = %s,
                    pat_allergies = %s,
                    pat_blood_type = %s,
                    pat_emergency_contact_name = %s,
                    pat_emergency_contact_phone = %s,
                    user_modified = %s,
                    date_modified = NOW()
                WHERE pat_id = %s
            """

            params = (
                data.get('pat_person_id'),
                data.get('pat_client_id'),
                data.get('pat_code', ''),
                data.get('pat_medical_conditions', ''),
                data.get('pat_allergies', ''),
                data.get('pat_blood_type'),
                data.get('pat_emergency_contact_name'),
                data.get('pat_emergency_contact_phone'),
                data.get('user_modified'),
                pat_id
            )

            # Ejecutar update
            result_db = DataBaseHandle.execute(sql, params)

            if result_db:
                return internal_response(True, "Paciente actualizado exitosamente", {"pat_id": pat_id})
            else:
                return internal_response(False, "Error al actualizar paciente", None)

        except Exception as e:
            HandleLogs.write_error(f"Error inesperado en PatientComponent.updatePatient: {str(e)}")
            return internal_response(False, "Error interno del servidor al actualizar paciente", None)

    @staticmethod
    def deletePatient(pat_id: int, user_modified: str):
        """
        Desactiva (soft delete) un paciente en la base de datos.

        NOTA:
        - No se elimina físicamente.
        - Se cambia el campo pat_state a FALSE para conservar el historial.
        """
        try:
            sql = """
                    UPDATE ceragen.admin_patient
                    SET 
                        pat_state = FALSE,
                        user_modified = %s,
                        date_modified = NOW()
                    WHERE pat_id = %s;
                """
            params = (user_modified, pat_id)

            result = DataBaseHandle.ExecuteNonQuery(sql, params)

            return result
        except Exception as e:
            HandleLogs.write_error(f"Error inesperado en PatientComponent.deletePatient: {str(e)}")
            return internal_response(False, "Error interno al eliminar el paciente", None)