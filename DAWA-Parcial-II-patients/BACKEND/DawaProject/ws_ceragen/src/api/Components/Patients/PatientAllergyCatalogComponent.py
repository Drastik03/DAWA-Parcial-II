from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.logs import HandleLogs
from ....utils.general.response import internal_response

class PatientAllergyCatalogComponent:

    @staticmethod
    def createAllergy(data: dict):
        try:
            sql = """
                INSERT INTO ceragen.clinic_allergy_catalog (
                    al_name,
                    al_description,
                    al_state,
                    user_created,
                    date_created
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
            return internal_response(True, "Alergia registrada exitosamente", result.get("data"))
        except Exception as e:
            HandleLogs.write_error(f"[createAllergy] {str(e)}")
            return internal_response(False, "Error al registrar alergia", None)

    @staticmethod
    def updateAllergy(al_id: int, data: dict):
        try:
            sql = """
                UPDATE ceragen.clinic_allergy_catalog
                SET al_name = %s,
                    al_description = %s,
                    al_state = %s,
                    user_modified = %s,
                    date_modified = NOW()
                WHERE al_id = %s AND date_deleted IS NULL
            """
            params = (
                data.get("al_name"),
                data.get("al_description"),
                data.get("al_state"),
                data.get("user_modified"),
                al_id
            )
            DataBaseHandle.ExecuteNonQuery(sql, params)
            return internal_response(True, "Alergia actualizada correctamente", {"al_id": al_id})
        except Exception as e:
            HandleLogs.write_error(f"[updateAllergy] {str(e)}")
            return internal_response(False, "Error al actualizar alergia", None)

    @staticmethod
    def deleteAllergy(al_id: int, user: str):
        try:
            sql = """
                UPDATE ceragen.clinic_allergy_catalog
                SET date_deleted = NOW(),
                    user_modified = %s
                WHERE al_id = %s AND date_deleted IS NULL
            """
            params = (user, al_id)
            DataBaseHandle.ExecuteNonQuery(sql, params)
            return internal_response(True, "Alergia eliminada correctamente", {"al_id": al_id})
        except Exception as e:
            HandleLogs.write_error(f"[deleteAllergy] {str(e)}")
            return internal_response(False, "Error al eliminar alergia", None)

    @staticmethod
    def listActiveAllergies():
        try:
            sql = """
                SELECT al_id, al_name, al_description, al_state, date_created
                FROM ceragen.clinic_allergy_catalog
                WHERE date_deleted IS NULL AND al_state = TRUE
                ORDER BY date_created DESC
            """
            result = DataBaseHandle.getRecords(sql)
            return internal_response(True, "Listado exitoso", result.get("data"))
        except Exception as e:
            HandleLogs.write_error(f"[listActiveAllergies] {str(e)}")
            return internal_response(False, "Error al obtener listado", None)
