from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.logs import HandleLogs
from ....utils.general.response import internal_response
from datetime import datetime


class MedicalHistoryComponent:
    """
    Componente de lógica de negocio para la gestión de historial médico del paciente.
    Realiza operaciones CRUD directas con la base de datos para la tabla ceragen.clinic_patient_medical_history.
    """

    @staticmethod
    def getAllMedicalHistories():
        """
        Obtiene todos los historiales médicos de la base de datos.
        """
        try:
            HandleLogs.write_log("Obteniendo todos los historiales médicos (MedicalHistoryComponent).")
            sql = """
                SELECT
                    hist_id,
                    hist_patient_id,
                    hist_primary_complaint,
                    to_char(hist_onset_date, 'DD/MM/YYYY') as hist_onset_date,
                    hist_related_trauma,
                    hist_current_treatment,
                    hist_notes,
                    user_created,
                    to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created,
                    user_modified,
                    to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') as date_modified,
                    user_deleted,
                    to_char(date_deleted, 'DD/MM/YYYY HH24:MI:SS') as date_deleted
                FROM ceragen.clinic_patient_medical_history;
            """
            db_response = DataBaseHandle.getRecords(sql, 0) # Renombramos a db_response para mayor claridad

            if db_response.get('result'): # Verificamos si la operación a la base de datos fue exitosa
                data_from_db = db_response.get('data') # <-- Usamos 'data' aquí
                if data_from_db: # Si la lista de datos no está vacía
                    return data_from_db # Devolvemos la lista de datos directamente
                else: # Si la consulta se ejecutó, pero no devolvió registros
                    HandleLogs.write_log("No se encontraron historiales médicos en la DB.")
                    return None # Devolvemos None
            else:
                # Si la operación a la base de datos falló
                message = db_response.get('message', 'Error en la base de datos al obtener historiales.')
                HandleLogs.write_error(f"Error en DBHandle.getRecords: {message}")
                return None # Devolvemos None

        except Exception as e:
            HandleLogs.write_error(f"Error inesperado en MedicalHistoryComponent.getAllMedicalHistories: {str(e)}")
            return None # Devolvemos None en caso de excepción

    @staticmethod
    def getMedicalHistoryById(hist_id: int):
        """
        Obtiene un historial médico específico por su ID.
        """
        try:
            HandleLogs.write_log(f"Obteniendo historial médico con ID: {hist_id} (MedicalHistoryComponent).")

            sql = """
                    SELECT
                        hist_id,
                        hist_patient_id,
                        hist_primary_complaint,
                        to_char(hist_onset_date, 'DD/MM/YYYY') as hist_onset_date,
                        hist_related_trauma,
                        hist_current_treatment,
                        hist_notes,
                        hist_state,
                        user_created,
                        to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created,
                        user_modified,
                        to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') as date_modified,
                        user_deleted,
                        to_char(date_deleted, 'DD/MM/YYYY HH24:MI:SS') as date_deleted
                    FROM ceragen.clinic_patient_medical_history
                    WHERE hist_id = %s AND hist_state = TRUE;
                """

            params = (hist_id,)
            result_db = DataBaseHandle.getRecords(sql, 1, params)  # 1 para un solo registro

            if result_db and result_db.get('result') and result_db.get('data'):
                return internal_response(True, "Historial médico obtenido exitosamente", result_db.get('data')[0])
            else:
                # Si no se encontró o hubo un error en la DB
                message = result_db.get('message', 'No se encontró el historial médico o está inactivo.')
                HandleLogs.write_error(f"No se encontró el Historial con ID {hist_id}: {message}")
                return internal_response(False, message, None)

        except Exception as err:
            HandleLogs.write_error(f"Error inesperado en MedicalHistoryComponent.getMedicalHistoryById: {str(err)}")
            return internal_response(False, "Error interno del servidor al obtener historial médico", None)

    @staticmethod
    def insertMedicalHistory(data):
        """
        Inserta un nuevo historial médico en la base de datos.
        """
        try:
            HandleLogs.write_log("Insertando nuevo historial médico (MedicalHistoryComponent).")
            sql = """
                    INSERT INTO ceragen.clinic_patient_medical_history (
                    hist_patient_id, hist_primary_complaint, hist_onset_date,
                    hist_related_trauma, hist_current_treatment, hist_notes,
                    user_created, date_created, user_modified, date_modified,
                    user_deleted, date_deleted
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    );
                    """
            params = (
                data['hist_patient_id'],
                data['hist_primary_complaint'],
                data.get('hist_onset_date'),
                data.get('hist_related_trauma'),
                data.get('hist_current_treatment'),
                data.get('hist_notes'),
                data['user_created'],
                data['date_created'],
                None,  # user_modified
                None,  # date_modified
                None,  # user_deleted
                None  # date_deleted
            )
            result_db = DataBaseHandle.ExecuteNonQuery(sql, params)

            if result_db.get('result'):
                new_hist_id = result_db.get('data')
                return internal_response(True, "Historial médico insertado exitosamente", {'hist_id': new_hist_id})
            else:
                return internal_response(False, result_db.get('message', 'Error al insertar historial médico'), None)

        except Exception as e:
            HandleLogs.write_error(f"Error en MedicalHistoryComponent.insertMedicalHistory: {str(e)}")
            return internal_response(False, "Error interno del servidor al insertar historial médico", None)

    @staticmethod
    def updateMedicalHistory(hist_id: int, data: dict):
        """
        Actualiza un historial médico existente en la base de datos,
        excluyendo campos críticos como hist_patient_id, user_created y date_created.
        """
        try:
            HandleLogs.write_log(f"Actualizando historial médico con ID: {hist_id} (MedicalHistoryComponent).")

            critical_fields = ['hist_patient_id', 'user_created', 'date_created']

            # Construir dinámicamente la parte SET de la consulta SQL
            set_clauses = []
            params = []

            for field, value in data.items():

                if field not in critical_fields and field not in ['hist_id']:
                    set_clauses.append(f"{field} = %s")
                    params.append(value)

            if not set_clauses:
                return internal_response(False, "No se proporcionaron datos válidos para actualizar.", None)

            sql = f"""
                UPDATE ceragen.clinic_patient_medical_history
                SET {', '.join(set_clauses)}
                WHERE hist_id = %s;
            """
            params.append(hist_id)

            result_db = DataBaseHandle.ExecuteNonQuery(sql, params)

            if result_db.get('result'):
                return internal_response(True, "Historial médico actualizado exitosamente", None)
            else:
                return internal_response(False, result_db.get('message', 'Error al actualizar historial médico'), None)

        except Exception as e:
            HandleLogs.write_error(f"Error en MedicalHistoryComponent.updateMedicalHistory: {str(e)}")
            return internal_response(False, "Error interno del servidor al actualizar historial médico", None)

    @staticmethod
    def deleteMedicalHistory(hist_id: int, user_deleted: str):
        """
        Realiza una eliminación lógica de un historial médico,
        estableciendo user_deleted y date_deleted.
        """
        try:
            HandleLogs.write_log(
                f"Eliminando lógicamente historial médico con ID: {hist_id} por usuario: {user_deleted} (MedicalHistoryComponent).")

            # 1. Verificar si el historial médico existe y no está ya eliminado
            sql_check = """
                    SELECT 1 FROM ceragen.clinic_patient_medical_history
                    WHERE hist_id = %s AND date_deleted IS NULL;
                """
            exists = DataBaseHandle.getRecords(sql_check, 1, (hist_id,))
            if not exists.get('result') or not exists.get('data'):
                return internal_response(False, f"Historial médico con ID {hist_id} no encontrado o ya eliminado.",
                                         None)

            # 2. Realizar la eliminación lógica
            sql_delete = """
                    UPDATE ceragen.clinic_patient_medical_history
                    SET
                        user_deleted = %s,
                        date_deleted = NOW()
                    WHERE hist_id = %s;
                """
            params = (user_deleted, hist_id)
            result_db = DataBaseHandle.ExecuteNonQuery(sql_delete, params)

            if result_db.get('result'):
                return internal_response(True, "Historial médico eliminado lógicamente exitosamente", None)
            else:
                return internal_response(False,
                                         result_db.get('message', 'Error al eliminar lógicamente historial médico'),
                                         None)

        except Exception as e:
            HandleLogs.write_error(f"Error en MedicalHistoryComponent.deleteMedicalHistory: {str(e)}")
            return internal_response(False, "Error interno del servidor al eliminar historial médico", None)

    @staticmethod
    def getMedicalHistoriesByPatientId(patient_id: int):
        """
        Obtiene todos los historiales médicos asociados a un ID de paciente específico.
        """
        try:
            HandleLogs.write_log(
                f"Obteniendo historiales médicos para paciente ID: {patient_id} (MedicalHistoryComponent).")

            sql = """
                        SELECT
                            hist_id,
                            hist_patient_id,
                            hist_primary_complaint,
                            to_char(hist_onset_date, 'DD/MM/YYYY') as hist_onset_date,
                            hist_related_trauma,
                            hist_current_treatment,
                            hist_notes,
                            hist_state,
                            user_created,
                            to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created,
                            user_modified,
                            to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') as date_modified,
                            user_deleted,
                            to_char(date_deleted, 'DD/MM/YYYY HH24:MI:SS') as date_deleted
                        FROM ceragen.clinic_patient_medical_history
                        WHERE hist_patient_id = %s AND hist_state = TRUE
                        ORDER BY date_created DESC; -- O el orden que prefieras
                    """
            params = (patient_id,)
            # Usamos 0 para indicar que esperamos múltiples registros
            result_db = DataBaseHandle.getRecords(sql, 0, params)

            if result_db.get('result'):
                data_from_db = result_db.get('data')
                if data_from_db:
                    return internal_response(True, "Historiales médicos obtenidos exitosamente para el paciente.",
                                             data_from_db)
                else:
                    return internal_response(False,
                                             f"No se encontraron historiales médicos para el paciente ID: {patient_id}",
                                             None)
            else:
                # Si la operación a la base de datos falló
                message = result_db.get('message',
                                        f"Error en la base de datos al obtener historiales para paciente ID: {patient_id}.")
                HandleLogs.write_error(f"Error en DBHandle.getRecords para patient_id {patient_id}: {message}")
                return internal_response(False, message, None)

        except Exception as err:
            HandleLogs.write_error(
                f"Error inesperado en MedicalHistoryComponent.getMedicalHistoriesByPatientId: {str(err)}")
            return internal_response(False, "Error interno del servidor al obtener historiales médicos del paciente",
                                     None)
