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


    @staticmethod
    def deletePatientDisease(pd_id: int, user: str):
        try:
            sql_check = "SELECT 1 FROM ceragen.clinic_patient_disease WHERE pd_id = %s AND date_deleted IS NULL"
            exists = DataBaseHandle.getRecords(sql_check, 1, (pd_id,))
            if not exists or not exists.get("result"):
                return internal_response(False, "Enfermedad no encontrada o ya eliminada", None)

            sql = """
                UPDATE ceragen.clinic_patient_disease
                SET date_deleted = NOW(),
                    user_deleted = %s
                WHERE pd_id = %s
            """
            DataBaseHandle.ExecuteNonQuery(sql, (user, pd_id))
            return internal_response(True, "Enfermedad eliminada correctamente", {"pd_id": pd_id})
        except Exception as e:
            HandleLogs.write_error(f"[deletePatientDisease] Error: {str(e)}")
            return internal_response(False, "Error al eliminar enfermedad", None)

    @staticmethod
    def listAllPatientDiseases():
        try:
            sql = """
                SELECT 
                    pd.pd_id,
                    pd.pd_patient_id,
                    pat.pat_code AS patient_code,
                    CONCAT(pers.per_names, ' ', pers.per_surnames) AS patient_full_name,
                    
                    cli.cli_id AS client_id,
                    cli.cli_name AS client_name,
                    
                    pd.pd_disease_id,
                    dis.dis_name AS disease_name,
                    dt.dst_name AS disease_type,
                    pd.pd_notes,
                    pd.pd_is_current,
                    pd.user_created,
                    TO_CHAR(pd.date_created, 'YYYY-MM-DD HH24:MI:SS') AS date_created,
                    pd.user_modified,
                    TO_CHAR(pd.date_modified, 'YYYY-MM-DD HH24:MI:SS') AS date_modified
                
                FROM ceragen.clinic_patient_disease pd
                JOIN ceragen.clinic_disease_catalog dis ON pd.pd_disease_id = dis.dis_id AND dis.date_deleted IS NULL
                LEFT JOIN ceragen.clinic_disease_type dt ON dis.dis_type_id = dt.dst_id AND dt.date_deleted IS NULL
                JOIN ceragen.admin_patient pat ON pd.pd_patient_id = pat.pat_id AND pat.date_deleted IS NULL
                JOIN ceragen.admin_person pers ON pat.pat_person_id = pers.per_id AND pers.date_deleted IS NULL
                JOIN ceragen.admin_client cli ON pat.pat_client_id = cli.cli_id AND cli.date_deleted IS NULL
                
                WHERE pd.date_deleted IS NULL
                ORDER BY pd.date_created DESC;

            """
            result = DataBaseHandle.getRecords(sql, 0)
            if result and result.get("result"):
                return internal_response(True, "Listado exitoso", result.get("data"))
            return internal_response(False, "No hay nada por mostrar", None)
        except Exception as e:
            HandleLogs.write_error(f"[listAllPatientDiseases] Error: {str(e)}")
            return internal_response(False, "Error al listar enfermedades", None)

    @staticmethod
    def getDiseasesByPatientId(patient_id: int):
        try:
            sql = """
                SELECT
                    pd.pd_id,
                    pd.pd_patient_id,
                    pat.pat_code AS patient_code,
                    CONCAT(per.per_names, ' ', per.per_surnames) AS patient_full_name,
                    pd.pd_disease_id,
                    dis.dis_name AS disease_name,
                    dt.dst_name AS disease_type,
                    pd.pd_notes,
                    pd.pd_is_current,
                    CASE WHEN pd.pd_is_current THEN 'Actual' ELSE 'Pasada' END AS disease_status,
                    pd.user_created,
                    TO_CHAR(pd.date_created, 'YYYY-MM-DD HH24:MI:SS') AS date_created,
                    pd.user_modified,
                    TO_CHAR(pd.date_modified, 'YYYY-MM-DD HH24:MI:SS') AS date_modified
                FROM ceragen.clinic_patient_disease pd
                JOIN ceragen.admin_patient pat ON pd.pd_patient_id = pat.pat_id AND pat.date_deleted IS NULL
                JOIN ceragen.admin_person per ON pat.pat_person_id = per.per_id AND per.date_deleted IS NULL
                JOIN ceragen.clinic_disease_catalog dis ON pd.pd_disease_id = dis.dis_id AND dis.date_deleted IS NULL
                LEFT JOIN ceragen.clinic_disease_type dt ON dis.dis_type_id = dt.dst_id AND dt.date_deleted IS NULL
                WHERE pd.pd_patient_id = %s
                  AND pd.date_deleted IS NULL
                ORDER BY pd.pd_is_current DESC, pd.date_created DESC
            """

            result = DataBaseHandle.getRecords(sql, 0, (patient_id,))

            result = DataBaseHandle.getRecords(sql, 0, (patient_id,))
            if not result or not result.get("result"):
                return internal_response(False, "No se encontraron enfermedades para el paciente", None)

            return internal_response(True, "Enfermedades obtenidas correctamente", result.get("data"))
        except Exception as e:
            HandleLogs.write_error(f"[getDiseasesByPatientId] Error: {str(e)}")
            return internal_response(False, "Error al obtener enfermedades", None)
