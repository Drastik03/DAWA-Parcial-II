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
                    pd_notes,
                    user_created,
                    date_created
                ) VALUES (%s, %s, %s, %s, NOW())
                RETURNING pd_id;
            """
            params = (
                data.get("pd_patient_id"),
                data.get("pd_disease_id"),
                data.get("pd_notes"),
                data.get("user_created")
            )
            result = DataBaseHandle.ExecuteInsert(sql, params)
            if result.get("result"):
                return internal_response(True, "Registro creado exitosamente", result.get("data"))
            return internal_response(False, "No se pudo crear", None)
        except Exception as e:
            HandleLogs.write_error(f"[createPatientDisease] Error: {str(e)}")
            return internal_response(False, "Error al crear enfermedad", None)

    @staticmethod
    def updatePatientDisease(pd_id: int, data: dict):
        try:
            sql = "SELECT 1 FROM ceragen.clinic_patient_disease WHERE pd_id = %s AND date_deleted IS NULL"
            exists = DataBaseHandle.getRecords(sql, 1, (pd_id,))
            if not exists or not exists.get("result"):
                return internal_response(False, "Registro no encontrado", None)

            sql_update = """
                UPDATE ceragen.clinic_patient_disease
                SET pd_disease_id = %s,
                    pd_notes = %s,
                    pd_is_current = %s,
                    user_modified = %s,
                    date_modified = NOW()
                WHERE pd_id = %s
            """
            params = (
                data.get("pd_disease_id"),
                data.get("pd_notes"),
                data.get("pd_is_current"),
                data.get("user_modified"),
                pd_id
            )
            result = DataBaseHandle.ExecuteNonQuery(sql_update, params)
            if result.get("result"):
                return internal_response(True, "Enfermedad actualizada correctamente", {"pd_id": pd_id})
            return internal_response(False, "No se actualizó", None)
        except Exception as e:
            HandleLogs.write_error(f"[updatePatientDisease] Error: {str(e)}")
            return internal_response(False, "Error al actualizar enfermedad", None)
