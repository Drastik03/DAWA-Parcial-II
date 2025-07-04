from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.logs import HandleLogs
from ....utils.general.response import internal_response

class PatientAllergyCatalogComponent:

    @staticmethod
    def createAllergy(data: dict):
        try:
            sql = """
                INSERT INTO ceragen.clinic_allergy_catalog (
                    al_name, al_description, al_state,
                    user_created, date_created
                ) VALUES (%s, %s, %s, %s, NOW())
                RETURNING al_id;
            """
            params = (
                data.get("al_name"),
                data.get("al_description"),
                data.get("al_state", True),
                data.get("user_created")
            )
            result = DataBaseHandle.ExecuteInsert(sql, params)
            if result.get("result"):
                return internal_response(True, "Alergia registrada", result.get("data"))
            return internal_response(False, "No se registró", None)
        except Exception as e:
            HandleLogs.write_error(f"[createAllergy] {str(e)}")
            return internal_response(False, "Error al registrar alergia", None)

    @staticmethod
    def updateAllergy(al_id: int, data: dict):
        try:
            sql = "SELECT 1 FROM ceragen.clinic_allergy_catalog WHERE al_id = %s AND date_deleted IS NULL"
            exists = DataBaseHandle.getRecords(sql, 1, (al_id,))
            if not exists or not exists.get("result"):
                return internal_response(False, "No existe la alergia", None)

            sql_update = """
                UPDATE ceragen.clinic_allergy_catalog
                SET al_name = %s,
                    al_description = %s,
                    al_state = %s,
                    user_modified = %s,
                    date_modified = NOW()
                WHERE al_id = %s
            """
            params = (
                data.get("al_name"),
                data.get("al_description"),
                data.get("al_state"),
                data.get("user_modified"),
                al_id
            )
            result = DataBaseHandle.ExecuteNonQuery(sql_update, params)
            if result.get("result"):
                return internal_response(True, "Alergia actualizada", {"al_id": al_id})
            return internal_response(False, "No se actualizó", None)
        except Exception as e:
            HandleLogs.write_error(f"[updateAllergy] {str(e)}")
            return internal_response(False, "Error al actualizar alergia", None)

    @staticmethod
    def listActiveAllergies():
        try:
            sql = """
                SELECT al_id, al_name, al_description
                FROM ceragen.clinic_allergy_catalog
                WHERE al_state = TRUE AND date_deleted IS NULL
                ORDER BY al_name;
            """
            result = DataBaseHandle.getRecords(sql,0)
            return internal_response(True, "Listado exitoso", result.get("data"))
        except Exception as e:
            HandleLogs.write_error(f"[listActiveAllergies] {str(e)}")
            return internal_response(False, "Error al listar", None)

    @staticmethod
    def deleteAllergy(al_id: int, user: str):
        try:
            sql_check = "SELECT 1 FROM ceragen.clinic_allergy_catalog WHERE al_id = %s AND date_deleted IS NULL"
            exists = DataBaseHandle.getRecords(sql_check, 1, (al_id,))
            if not exists or not exists.get("result"):
                return internal_response(False, "Alergia no encontrada o ya eliminada", None)

            sql = """
                UPDATE ceragen.clinic_allergy_catalog
                SET al_state = False, date_deleted = NOW(), user_deleted = %s
                WHERE al_id = %s
            """
            DataBaseHandle.ExecuteNonQuery(sql, (user, al_id))
            return internal_response(True, "Alergia eliminada correctamente", {"al_id": al_id})
        except Exception as e:
            HandleLogs.write_error(f"[deleteAllergy] Error: {str(e)}")
            return internal_response(False, "Error al eliminar alergia", None)

    @staticmethod
    def getAllergyById(al_id: int):
        try:
            sql = """
                SELECT al_id, al_name, al_description, al_state,
                       user_created, date_created, user_modified, date_modified
                FROM ceragen.clinic_allergy_catalog
                WHERE al_id = %s AND date_deleted IS NULL
            """
            result = DataBaseHandle.getRecords(sql, 1, (al_id,))
            if not result or not result.get("result"):
                return internal_response(False, "Alergia no encontrada", None)

            return internal_response(True, "Alergia obtenida correctamente", result.get("data"))
        except Exception as e:
            HandleLogs.write_error(f"[getAllergyById] Error: {str(e)}")
            return internal_response(False, "Error al obtener alergia", None)
