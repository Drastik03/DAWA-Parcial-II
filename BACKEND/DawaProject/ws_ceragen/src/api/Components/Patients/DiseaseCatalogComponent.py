from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.logs import HandleLogs
from ....utils.general.response import internal_response
from datetime import datetime

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
            if result.get("result"):
                return internal_response(True, "Registro creado exitosamente", result.get("data"))
            return internal_response(False, "No se pudo crear", None)
        except Exception as e:
            HandleLogs.write_error(f"[createDiseaseCatalog] Error: {str(e)}")
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
            result = DataBaseHandle.ExecuteNonQuery(sql_update, params)
            if result.get("result"):
                return internal_response(True, "Registro actualizado correctamente", {"dis_id": dis_id})
            return internal_response(False, "No se actualizó", None)
        except Exception as e:
            HandleLogs.write_error(f"[updateDiseaseCatalog] Error: {str(e)}")
            return internal_response(False, "Error al actualizar enfermedad", None)

    @staticmethod
    def listDiseaseCatalog():
        try:
            sql = """
                       SELECT
                           cdc.dis_id,
                           cdt.dst_name,
                           cdc.dis_name,
                           cdc.dis_description,
                           cdc.dis_state,
                           cdc.user_created,
                           TO_CHAR(cdc.date_created, 'DD/MM/YYYY HH24:MI:SS') AS date_created,
                           cdc.user_modified,
                           TO_CHAR(cdc.date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified,
                           cdc.user_deleted,
                           TO_CHAR(cdc.date_deleted, 'DD/MM/YYYY HH24:MI:SS') AS date_deleted,

                           cdt.dst_id,
                           cdt.dst_name AS disease_type_name,
                           cdt.dst_description AS disease_type_description,
                           cdt.dst_state,
                           cdt.user_created AS disease_type_user_created,
                           TO_CHAR(cdt.date_created, 'DD/MM/YYYY HH24:MI:SS') AS disease_type_date_created,
                           cdt.user_modified AS disease_type_user_modified,
                           TO_CHAR(cdt.date_modified, 'DD/MM/YYYY HH24:MI:SS') AS disease_type_date_modified,
                           cdt.user_deleted AS disease_type_user_deleted,
                           TO_CHAR(cdt.date_deleted, 'DD/MM/YYYY HH24:MI:SS') AS disease_type_date_deleted
                       FROM ceragen.clinic_disease_catalog cdc
                       LEFT JOIN ceragen.clinic_disease_type cdt
                           ON cdc.dis_type_id = cdt.dst_id
                       WHERE cdc.date_deleted IS NULL
                         AND cdc.dis_state = TRUE
                         AND (cdt.date_deleted IS NULL OR cdt.date_deleted IS NOT NULL) -- Opcional, puedes filtrar solo tipos activos si quieres
                       ORDER BY cdc.dis_id;
                   """
            result = DataBaseHandle.getRecords(sql,0)
            if result.get("result"):
                return internal_response(True, "Datos obtenidos correctamente", result.get("data"))
            return internal_response(False, "No se encontraron registros", None)
        except Exception as e:
            HandleLogs.write_error(f"[listDiseaseCatalog] Error: {str(e)}")
            return internal_response(False, "Error al listar enfermedades", None)

    @staticmethod
    def deleteDiseaseCatalog(dis_id: int, user: str):
        try:
            sql_check = "SELECT 1 FROM ceragen.clinic_disease_catalog WHERE dis_id = %s AND date_deleted IS NULL"
            exists = DataBaseHandle.getRecords(sql_check, 1, (dis_id,))
            if not exists or not exists.get("result"):
                return internal_response(False, "Enfermedad no encontrada o ya eliminada", None)

            sql = """
                    UPDATE ceragen.clinic_disease_catalog
                    SET date_deleted = NOW(),
                        user_deleted = %s
                    WHERE dis_id = %s
                """
            DataBaseHandle.ExecuteNonQuery(sql, (user, dis_id))
            return internal_response(True, "Enfermedad eliminada correctamente", {"dis_id": dis_id})
        except Exception as e:
            HandleLogs.write_error(f"[deleteDiseaseCatalog] Error: {str(e)}")
            return internal_response(False, "Error al eliminar enfermedad", None)
