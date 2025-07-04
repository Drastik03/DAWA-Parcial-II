from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.logs import HandleLogs
from ....utils.general.response import internal_response

class PatientDiseaseComponent:

    @staticmethod
    def createPatientDisease(data: dict):
        try:
            sql = """
                INSERT INTO ceragen.clinic_patient_disease (
                    pd_patient_id,
                    pd_disease_id,
                    pd_diagnosis_description,
                    pd_observation,
                    user_created,
                    date_created
                ) VALUES (%s, %s, %s, %s, %s, NOW())
                RETURNING pd_id;
            """
            params = (
                data.get("pd_patient_id"),
                data.get("pd_disease_id"),
                data.get("pd_diagnosis_description"),
                data.get("pd_observation"),
                data.get("user_created")
            )
            result = DataBaseHandle.ExecuteInsert(sql, params)
            return internal_response(True, "Registro creado", result.get("data"))
        except Exception as e:
            HandleLogs.write_error(f"[createPatientDisease] {str(e)}")
            return internal_response(False, "Error al crear", None)

    @staticmethod
    def updatePatientDisease(pd_id: int, data: dict):
        try:
            sql_check = "SELECT 1 FROM ceragen.clinic_patient_disease WHERE pd_id = %s AND date_deleted IS NULL"
            exists = DataBaseHandle.getRecords(sql_check, 1, (pd_id,))
            if not exists.get("result"):
                return internal_response(False, "Registro no encontrado", None)

            sql = """
                UPDATE ceragen.clinic_patient_disease
                SET pd_patient_id = %s,
                    pd_disease_id = %s,
                    pd_diagnosis_description = %s,
                    pd_observation = %s,
                    user_modified = %s,
                    date_modified = NOW()
                WHERE pd_id = %s
            """
            params = (
                data.get("pd_patient_id"),
                data.get("pd_disease_id"),
                data.get("pd_diagnosis_description"),
                data.get("pd_observation"),
                data.get("user_modified"),
                pd_id
            )
            DataBaseHandle.ExecuteNonQuery(sql, params)
            return internal_response(True, "Registro actualizado", {"pd_id": pd_id})
        except Exception as e:
            HandleLogs.write_error(f"[updatePatientDisease] {str(e)}")
            return internal_response(False, "Error al actualizar", None)

    @staticmethod
    def deletePatientDisease(pd_id: int, user_modified: str):
        try:
            sql = """
                UPDATE ceragen.clinic_patient_disease
                SET date_deleted = NOW(),
                    user_modified = %s
                WHERE pd_id = %s
            """
            DataBaseHandle.ExecuteNonQuery(sql, (user_modified, pd_id))
            return internal_response(True, "Registro eliminado", {"pd_id": pd_id})
        except Exception as e:
            HandleLogs.write_error(f"[deletePatientDisease] {str(e)}")
            return internal_response(False, "Error al eliminar", None)

    @staticmethod
    def listPatientDiseases():
        try:
            sql = """
                SELECT pd_id, pd_patient_id, pd_disease_id, pd_diagnosis_description, pd_observation, date_created
                FROM ceragen.clinic_patient_disease
                WHERE date_deleted IS NULL
                ORDER BY pd_id DESC
            """
            result = DataBaseHandle.getRecords(sql)
            return internal_response(True, "Listado exitoso", result.get("data"))
        except Exception as e:
            HandleLogs.write_error(f"[listPatientDiseases] {str(e)}")
            return internal_response(False, "Error al listar", None)
