from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.logs import HandleLogs
from ....utils.general.response import internal_response

class DiseaseTypeComponent:

    @staticmethod
    def createDiseaseType(data: dict):
        try:
            sql = """
                INSERT INTO ceragen.clinic_disease_type (
                    dst_name,
                    dst_description,
                    dst_state,
                    user_created,
                    date_created
                ) VALUES (%s, %s, %s, %s, NOW())
                RETURNING dst_id;
            """
            params = (
                data.get("dst_name"),
                data.get("dst_description"),
                data.get("dst_state", True),
                data.get("user_created")
            )
            result = DataBaseHandle.ExecuteInsert(sql, params)
            return internal_response(True, "Tipo de enfermedad creado exitosamente", result.get("data"))
        except Exception as e:
            HandleLogs.write_error(f"[createDiseaseType] Error: {str(e)}")
            return internal_response(False, "Error al crear tipo", None)

    @staticmethod
    def updateDiseaseType(dst_id: int, data: dict):
        try:
            sql_check = "SELECT 1 FROM ceragen.clinic_disease_type WHERE dst_id = %s AND date_deleted IS NULL"
            exists = DataBaseHandle.getRecords(sql_check, 1, (dst_id,))
            if not exists or not exists.get("result"):
                return internal_response(False, "Registro no encontrado", None)

            sql_update = """
                UPDATE ceragen.clinic_disease_type
                SET dst_name = %s,
                    dst_description = %s,
                    dst_state = %s,
                    user_modified = %s,
                    date_modified = NOW()
                WHERE dst_id = %s
            """
            params = (
                data.get("dst_name"),
                data.get("dst_description"),
                data.get("dst_state", True),
                data.get("user_modified"),
                dst_id
            )
            DataBaseHandle.ExecuteNonQuery(sql_update, params)
            return internal_response(True, "Tipo actualizado correctamente", {"dst_id": dst_id})
        except Exception as e:
            HandleLogs.write_error(f"[updateDiseaseType] Error: {str(e)}")
            return internal_response(False, "Error al actualizar tipo", None)

    @staticmethod
    def deleteDiseaseType(dst_id: int, user: str):
        try:
            sql = """
                UPDATE ceragen.clinic_disease_type
                SET date_deleted = NOW(),
                    user_modified = %s
                WHERE dst_id = %s AND date_deleted IS NULL
            """
            DataBaseHandle.ExecuteNonQuery(sql, (user, dst_id))
            return internal_response(True, "Tipo eliminado correctamente", {"dst_id": dst_id})
        except Exception as e:
            HandleLogs.write_error(f"[deleteDiseaseType] {str(e)}")
            return internal_response(False, "Error al eliminar tipo", None)

    @staticmethod
    def listDiseaseType():
        try:
            sql = """
                SELECT dst_id, dst_name, dst_description, dst_state,
                       user_created, date_created, user_modified, date_modified
                FROM ceragen.clinic_disease_type
                WHERE date_deleted IS NULL AND dst_state = TRUE
            """
            result = DataBaseHandle.getRecords(sql)
            return internal_response(True, "Tipos obtenidos correctamente", result.get("data"))
        except Exception as e:
            HandleLogs.write_error(f"[listDiseaseType] Error: {str(e)}")
            return internal_response(False, "Error al listar tipos", None)

