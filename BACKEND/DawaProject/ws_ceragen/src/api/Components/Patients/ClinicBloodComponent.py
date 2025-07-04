from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.logs import HandleLogs
from ....utils.general.response import internal_response,response_success, response_error, response_not_found
from datetime import datetime

class ClinicBloodTypeComponent:

    @staticmethod
    def getAllBloodTypes():
        try:
            HandleLogs.write_log("Obteniendo todos los tipos de sangre activos desde la DB (ClinicBloodTypeComponent).")
            sql = """
                SELECT
                    btp_id,
                    btp_type,
                    btp_description,
                    btp_state,
                    user_created,
                    to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created,
                    user_modified,
                    to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') as date_modified,
                    user_deleted,
                    to_char(date_deleted, 'DD/MM/YYYY HH24:MI:SS') as date_deleted
                FROM ceragen.clinic_blood_type
                WHERE btp_state = TRUE;
            """
            result = DataBaseHandle.getRecords(sql, 0)
            return result.get('data') if result and result.get('result') else None
        except Exception as e:
            HandleLogs.write_error(f"Error en getAllBloodTypes: {str(e)}")
            return None

    @staticmethod
    def getBloodTypeById(btp_id: int):
        try:
            HandleLogs.write_log(f"Obteniendo tipo de sangre con ID {btp_id}.")
            sql = """
                SELECT * FROM ceragen.clinic_blood_type
                WHERE btp_id = %s AND btp_state = TRUE;
            """
            result = DataBaseHandle.getRecords(sql, 1, (btp_id,))
            return result.get('data') if result and result.get('result') else None
        except Exception as e:
            HandleLogs.write_error(f"Error en getBloodTypeById: {str(e)}")
            return None

    @staticmethod
    def createBloodType(data: dict):
        try:
            HandleLogs.write_log(f"Creando nuevo tipo de sangre. Datos: {data}")
            sql = """
                INSERT INTO ceragen.clinic_blood_type (
                    btp_type,
                    btp_state,
                    btp_description,
                    user_created,
                    date_created
                ) VALUES (%s,True, %s, %s, NOW())
                RETURNING btp_id;
            """
            params = (
                data.get('btp_type'),
                data.get('btp_description'),
                data.get('user_created')
            )
            result = DataBaseHandle.ExecuteInsert(sql, params)
            if result.get("result"):
                return internal_response(True, "Tipo de sangre creado exitosamente", {"btp_id": result["data"][0]["btp_id"]})
            else:
                return internal_response(False, result.get("message", "Error al crear tipo de sangre"), None)
        except Exception as e:
            HandleLogs.write_error(f"Error en createBloodType: {str(e)}")
            return internal_response(False, "Error interno al crear tipo de sangre", None)

    @staticmethod
    def updateBloodType(btp_id: int, data: dict):
        try:
            HandleLogs.write_log(f"Actualizando tipo de sangre ID {btp_id}.")
            if not data.get('user_modified'):
                return internal_response(False, "El usuario que modifica es requerido", None)
            sql_check = "SELECT 1 FROM ceragen.clinic_blood_type WHERE btp_id = %s AND btp_state = TRUE"
            exists = DataBaseHandle.getRecords(sql_check, 1, (btp_id,))
            if not exists or not exists.get('result') or not exists.get('data'):
                return internal_response(False, "Tipo de sangre no encontrado", None)
            sql = """
                UPDATE ceragen.clinic_blood_type SET
                    btp_type = %s,
                    btp_description = %s,
                    user_modified = %s,
                    date_modified = NOW()
                WHERE btp_id = %s;
            """
            params = (
                data.get('btp_type'),
                data.get('btp_description'),
                data.get('user_modified'),
                btp_id
            )
            result = DataBaseHandle.execute(sql, params)
            return internal_response(True, "Tipo de sangre actualizado exitosamente", {"btp_id": btp_id}) if result else internal_response(False, "Error al actualizar", None)
        except Exception as e:
            HandleLogs.write_error(f"Error en updateBloodType: {str(e)}")
            return internal_response(False, "Error interno al actualizar", None)

    @staticmethod
    def deleteBloodType(btp_id: int, user_deleted: str):
        try:
            sql = """
                UPDATE ceragen.clinic_blood_type
                SET btp_state = FALSE,
                    user_deleted = %s,
                    date_deleted = NOW(),
                    user_modified = %s,
                    date_modified = NOW()
                WHERE btp_id = %s;
            """
            params = (user_deleted, user_deleted, btp_id)
            result = DataBaseHandle.ExecuteNonQuery(sql, params)
            if result:
                return internal_response(True, "Tipo de sangre eliminado con éxito", None)
            else:
                return internal_response(False, "No se pudo eliminar el tipo de sangre", None)
        except Exception as e:
            HandleLogs.write_error(f"Error en deleteBloodType: {str(e)}")
            return internal_response(False, "Error interno al eliminar tipo de sangre", None)




