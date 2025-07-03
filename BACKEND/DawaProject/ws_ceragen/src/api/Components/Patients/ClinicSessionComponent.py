from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.logs import HandleLogs
from ....utils.general.response import internal_response,response_success, response_error, response_not_found
from datetime import datetime

class ClinicSessionComponent:

    @staticmethod
    def getAllSessions():
        try:
            HandleLogs.write_log("Obteniendo todas las sesiones clínicas activas desde la DB (ClinicSessionComponent).")
            sql = """
                SELECT
                    cli_id,
                    cli_person_id,
                    cli_identification,
                    cli_name,
                    cli_address_bill,
                    cli_mail_bill,
                    cli_state,
                    user_created,
                    to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created,
                    user_modified,
                    to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') as date_modified,
                    user_deleted,
                    to_char(date_deleted, 'DD/MM/YYYY HH24:MI:SS') as date_deleted
                FROM ceragen.admin_client
                WHERE cli_state = TRUE;
            """
            result = DataBaseHandle.getRecords(sql, 0)
            return result.get('data') if result and result.get('result') else None
        except Exception as e:
            HandleLogs.write_error(f"Error en getAllSessions: {str(e)}")
            return None

    @staticmethod
    def getSessionById(cli_id: int):
        try:
            HandleLogs.write_log(f"Obteniendo sesión clínica con ID {cli_id}.")
            sql = """
                SELECT * FROM ceragen.admin_client
                WHERE cli_id = %s AND cli_state = TRUE;
            """
            result = DataBaseHandle.getRecords(sql, 1, (cli_id,))
            return result.get('data') if result and result.get('result') else None
        except Exception as e:
            HandleLogs.write_error(f"Error en getSessionById: {str(e)}")
            return None

    @staticmethod
    def createSession(data: dict):
        try:
            HandleLogs.write_log(f"Creando nueva sesión clínica. Datos: {data}")
            sql = """
                INSERT INTO ceragen.admin_client (
                    cli_person_id,
                    cli_identification,
                    cli_name,
                    cli_address_bill,
                    cli_mail_bill,
                    user_created,
                    date_created
                ) VALUES (%s, %s, %s, %s, %s, %s, NOW())
                RETURNING cli_id;
            """
            params = (
                data.get('cli_person_id'),
                data.get('cli_identification'),
                data.get('cli_name'),
                data.get('cli_address_bill'),
                data.get('cli_mail_bill'),
                data.get('user_created')
            )
            result = DataBaseHandle.ExecuteInsert(sql, params)
            if result.get("result"):
                return internal_response(True, "Sesión creada exitosamente", {"cli_id": result["data"][0]["cli_id"]})
            else:
                return internal_response(False, result.get("message", "Error al crear sesión"), None)
        except Exception as e:
            HandleLogs.write_error(f"Error en createSession: {str(e)}")
            return internal_response(False, "Error interno al crear sesión", None)

    @staticmethod
    def updateSession(cli_id: int, data: dict):
        try:
            HandleLogs.write_log(f"Actualizando sesión clínica ID {cli_id}.")
            if not data.get('user_modified'):
                return internal_response(False, "El usuario que modifica es requerido", None)
            sql_check = "SELECT 1 FROM ceragen.admin_client WHERE cli_id = %s AND cli_state = TRUE"
            exists = DataBaseHandle.getRecords(sql_check, 1, (cli_id,))
            if not exists or not exists.get('result') or not exists.get('data'):
                return internal_response(False, "Sesión no encontrada", None)
            sql = """
                UPDATE ceragen.admin_client SET
                    cli_person_id = %s,
                    cli_identification = %s,
                    cli_name = %s,
                    cli_address_bill = %s,
                    cli_mail_bill = %s,
                    user_modified = %s,
                    date_modified = NOW()
                WHERE cli_id = %s;
            """
            params = (
                data.get('cli_person_id'),
                data.get('cli_identification'),
                data.get('cli_name'),
                data.get('cli_address_bill'),
                data.get('cli_mail_bill'),
                data.get('user_modified'),
                cli_id
            )
            result = DataBaseHandle.execute(sql, params)
            return internal_response(True, "Sesión actualizada exitosamente", {"cli_id": cli_id}) if result else internal_response(False, "Error al actualizar", None)
        except Exception as e:
            HandleLogs.write_error(f"Error en updateSession: {str(e)}")
            return internal_response(False, "Error interno al actualizar", None)

    @staticmethod
    def deleteSession(cli_id: int, user_modified: str):
        try:
            sql = """
                UPDATE ceragen.admin_client
                SET cli_state = FALSE,
                    user_modified = %s,
                    date_modified = NOW()
                WHERE cli_id = %s;
            """
            params = (user_modified, cli_id)
            result = DataBaseHandle.ExecuteNonQuery(sql, params)
            return result
        except Exception as e:
            HandleLogs.write_error(f"Error en deleteSession: {str(e)}")
            return internal_response(False, "Error interno al eliminar sesión", None)
