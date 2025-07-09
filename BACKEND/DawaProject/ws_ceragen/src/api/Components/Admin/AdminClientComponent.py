from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from datetime import datetime
from ....utils.general.response import internal_response

class AdminClientComponent:
    @staticmethod
    def ListAllClients():
        try:
            query = """
                SELECT cli_id, cli_person_id, cli_identification, cli_name, 
                       cli_address_bill, cli_mail_bill, cli_state, 
                       user_created, to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created,
                       user_modified, to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') as date_modified,
                       user_deleted, to_char(date_deleted, 'DD/MM/YYYY HH24:MI:SS') as date_deleted
                FROM ceragen.admin_client
                WHERE cli_state = true
            """
            return DataBaseHandle.getRecords(query, 0)
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def GetClientById(cli_id):
        try:
            query = """
                SELECT cli_id, cli_person_id, cli_identification, cli_name, 
                       cli_address_bill, cli_mail_bill, cli_state, 
                       user_created, to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created,
                       user_modified, to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') as date_modified,
                       user_deleted, to_char(date_deleted, 'DD/MM/YYYY HH24:MI:SS') as date_deleted
                FROM ceragen.admin_client
                WHERE cli_id = %s
            """
            return DataBaseHandle.getRecords(query, 1, (cli_id,))
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def AddClient(data):
        v_result = False
        v_message = None
        v_data = None
        try:
            sql = """
                INSERT INTO ceragen.admin_client (
                    cli_person_id, cli_identification, cli_name, 
                    cli_address_bill, cli_mail_bill, cli_state,
                    user_created, date_created
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING cli_id
            """
            record = (
                data["cli_person_id"],
                data["cli_identification"],
                data["cli_name"],
                data["cli_address_bill"],
                data["cli_mail_bill"],
                True,
                data["user_process"],
                datetime.now()
            )
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al insertar cliente: {err}"
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def UpdateClient(data):
        v_result = False
        v_message = None
        v_data = None
        try:
            sql = """
                UPDATE ceragen.admin_client 
                SET cli_person_id = %s,
                    cli_identification = %s,
                    cli_name = %s,
                    cli_address_bill = %s,
                    cli_mail_bill = %s,
                    user_modified = %s,
                    date_modified = %s
                WHERE cli_id = %s
            """
            record = (
                data["cli_person_id"],
                data["cli_identification"],
                data["cli_name"],
                data["cli_address_bill"],
                data["cli_mail_bill"],
                data["user_modified"],
                datetime.now(),
                data["cli_id"]
            )
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al actualizar cliente: {err}"
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def DeleteClient(cli_id, user):
        try:
            sql = """
                UPDATE ceragen.admin_client
                SET cli_state = false,
                    user_deleted = %s,
                    date_deleted = %s
                WHERE cli_id = %s
            """
            record = (user, datetime.now(), cli_id)
            rows_affected = DataBaseHandle.ExecuteNonQuery(sql, record)
            HandleLogs.write_log("Filas afectadas: " + str(rows_affected))

            if rows_affected["data"] > 0:
                return True, f"Registro eliminado exitosamente."
            else:
                return False, f"No se encontró ningún registro con ID {cli_id}."
        except Exception as err:
            HandleLogs.write_error(err)
            return None
