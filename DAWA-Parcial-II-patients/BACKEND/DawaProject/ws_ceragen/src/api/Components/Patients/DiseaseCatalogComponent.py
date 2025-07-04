from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.logs import HandleLogs
from ....utils.general.response import internal_response

class DiseaseCatalogComponent:
    @staticmethod
    def createDiseaseCatalog(data: dict):
        try:
            sql = """
                INSERT INTO ceragen.clinic_disease_catalog (
                    dis_name,
                    dis_description,
                    dis_type_id,
                    dis_state,
                    user_created,
                    date_created
                ) VALUES (%s, %s, %s, %s, %s, NOW())
                RETURNING dis_id;
            """
            params = (
                data.get("dis_name"),
                data.get("dis_description"),
                data.get("dis_type_id"),
                data.get("dis_state", True),
                data.get("user_created")
            )
            result = DataBaseHandle.ExecuteInsert(sql, params)
            return internal_response(True, "Registro creado exitosamente", result.get("data"))
        except Exception as e:
            HandleLogs.write_error(f"[createDiseaseCatalog] {str(e)}")
            return internal_response(False, "Error al crear enfermedad", None)

    @staticmethod
    def updateDiseaseCatalog(dis_id: int, data: dict):
        try:
            sql_check = "SELECT 1 FROM ceragen.clinic_disease_catalog WHERE dis_id = %s AND date_deleted IS NULL"
            exists = DataBaseHandle.getRecords(sql_check, 1, (dis_id,))
            if not exists or not exists.get("result"):
                return internal_response(False, "Registro no encontrado", None)

            sql_update = """
                UPDATE ceragen.clinic_disease_catalog
                SET dis_name = %s,
                    dis_description = %s,
                    dis_type_id = %s,
                    dis_state = %s,
                    user_modified = %s,
                    date_modified = NOW()
                WHERE dis_id = %s
            """
            params = (
                data.get("dis_name"),
                data.get("dis_description"),
                data.get("dis_type_id"),
                data.get("dis_state", True),
                data.get("user_modified"),
                dis_id
            )
            DataBaseHandle.ExecuteNonQuery(sql_update, params)
            return internal_response(True, "Registro actualizado correctamente", {"dis_id": dis_id})
        except Exception as e:
            HandleLogs.write_error(f"[updateDiseaseCatalog] {str(e)}")
            return internal_response(False, "Error al actualizar enfermedad", None)

    @staticmethod
    def deleteDiseaseCatalog(dis_id: int, user: str):
        try:
            sql = """
                UPDATE ceragen.clinic_disease_catalog
                SET date_deleted = NOW(),
                    user_modified = %s
                WHERE dis_id = %s AND date_deleted IS NULL
            """
            DataBaseHandle.ExecuteNonQuery(sql, (user, dis_id))
            return internal_response(True, "Registro eliminado correctamente", {"dis_id": dis_id})
        except Exception as e:
            HandleLogs.write_error(f"[deleteDiseaseCatalog] {str(e)}")
            return internal_response(False, "Error al eliminar enfermedad", None)

    @staticmethod
    def listDiseaseCatalog():
        try:
            sql = """
                SELECT dis_id, dis_name, dis_description, dis_type_id, dis_state,
                       user_created, date_created, user_modified, date_modified
                FROM ceragen.clinic_disease_catalog
                WHERE date_deleted IS NULL AND dis_state = TRUE
            """
            result = DataBaseHandle.getRecords(sql)
            return internal_response(True, "Datos obtenidos correctamente", result.get("data"))
        except Exception as e:
            HandleLogs.write_error(f"[listDiseaseCatalog] {str(e)}")
            return internal_response(False, "Error al listar enfermedades", None)
