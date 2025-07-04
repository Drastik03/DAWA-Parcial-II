from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.logs import HandleLogs
from ....utils.general.response import internal_response
from datetime import datetime

class PatientAllergyComponent:

    @staticmethod
    def createPatientAllergy(data: dict):
        try:
            sql = """
                INSERT INTO ceragen.clinic_patient_allergy (
                    pa_patient_id,
                    pa_allergy_id,
                    pa_reaction_description,
                    user_created,
                    date_created
                ) VALUES (%s, %s, %s, %s, NOW())
                RETURNING pa_id;
            """
            params = (
                data.get("pa_patient_id"),
                data.get("pa_allergy_id"),
                data.get("pa_reaction_description"),
                data.get("user_created")
            )
            result = DataBaseHandle.ExecuteInsert(sql, params)
            if result.get("result"):
                return internal_response(True, "Registro creado exitosamente", result.get("data"))
            return internal_response(False, "No se pudo crear", None)
        except Exception as e:
            HandleLogs.write_error(f"[createPatientAllergy] Error: {str(e)}")
            return internal_response(False, "Error al crear alergia", None)

    @staticmethod
    def updatePatientAllergy(pa_id: int, data: dict):
        try:
            sql = "SELECT 1 FROM ceragen.clinic_patient_allergy WHERE pa_id = %s AND date_deleted IS NULL"
            exists = DataBaseHandle.getRecords(sql, 1, (pa_id,))
            if not exists or not exists.get("result"):
                return internal_response(False, "Registro no encontrado", None)

            sql_update = """
                UPDATE ceragen.clinic_patient_allergy
                SET pa_patient_id = %s,
                    pa_allergy_id = %s,
                    pa_reaction_description = %s,
                    user_modified = %s,
                    date_modified = NOW()
                WHERE pa_id = %s
            """
            params = (
                data.get("pa_patient_id"),
                data.get("pa_allergy_id"),
                data.get("pa_reaction_description"),
                data.get("user_modified"),
                pa_id
            )
            result = DataBaseHandle.ExecuteNonQuery(sql_update, params)
            if result.get("result"):
                return internal_response(True, "Alergia actualizada correctamente", {"pa_id": pa_id})
            return internal_response(False, "No se actualizó", None)
        except Exception as e:
            HandleLogs.write_error(f"[updatePatientAllergy] Error: {str(e)}")
            return internal_response(False, "Error al actualizar alergia", None)

    @staticmethod
    def deletePatientAllergy(pa_id: int, user: str):
        try:
            sql_check = "SELECT 1 FROM ceragen.clinic_patient_allergy WHERE pa_id = %s AND date_deleted IS NULL"
            exists = DataBaseHandle.getRecords(sql_check, 1, (pa_id,))
            if not exists or not exists.get("result"):
                return internal_response(False, "Registro no encontrado o ya eliminado", None)

            sql_delete = """
                UPDATE ceragen.clinic_patient_allergy
                SET date_deleted = NOW(),
                    user_modified = %s
                WHERE pa_id = %s
            """
            params = (user, pa_id)
            result = DataBaseHandle.ExecuteNonQuery(sql_delete, params)
            if result.get("result"):
                return internal_response(True, "Alergia eliminada correctamente", {"pa_id": pa_id})
            return internal_response(False, "No se eliminó", None)
        except Exception as e:
            HandleLogs.write_error(f"[deletePatientAllergy] Error: {str(e)}")
            return internal_response(False, "Error al eliminar alergia", None)

    @staticmethod
    def getPatientAllergyById(pa_id: int):
        try:
            sql = """
                SELECT pa_id, pa_patient_id, pa_allergy_id, pa_reaction_description, date_created
                FROM ceragen.clinic_patient_allergy
                WHERE pa_id = %s AND date_deleted IS NULL
            """
            result = DataBaseHandle.getRecords(sql, 1, (pa_id,))
            if result.get("result"):
                return internal_response(True, "Alergia encontrada", result.get("data"))
            return internal_response(False, "No se encontró el registro", None)
        except Exception as e:
            HandleLogs.write_error(f"[getPatientAllergyById] Error: {str(e)}")
            return internal_response(False, "Error al obtener alergia", None)

    @staticmethod
    def getAllPatientAllergies():
        try:
            sql = """
                SELECT pa_id, pa_patient_id, pa_allergy_id, pa_reaction_description, date_created
                FROM ceragen.clinic_patient_allergy
                WHERE date_deleted IS NULL
                ORDER BY date_created DESC
            """
            result = DataBaseHandle.getRecords(sql, 0)
            if result.get("result"):
                return internal_response(True, "Listado de alergias obtenido", result.get("data"))
            return internal_response(False, "No hay registros", None)
        except Exception as e:
            HandleLogs.write_error(f"[getAllPatientAllergies] Error: {str(e)}")
            return internal_response(False, "Error al listar alergias", None)
