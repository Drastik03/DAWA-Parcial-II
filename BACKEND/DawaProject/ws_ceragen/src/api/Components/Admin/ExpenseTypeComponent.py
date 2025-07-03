from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from datetime import datetime
from ....utils.general.response import internal_response

class ExpenseTypeComponent:
    @staticmethod
    def ListAllExpenseType():
        try:
            query = """
                SELECT ext_id, ext_name, ext_description, ext_state, 
                       user_created, to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created, 
                       user_modified, to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') as date_modified, 
                       user_deleted, to_char(date_deleted, 'DD/MM/YYYY HH24:MI:SS') as date_deleted 
                FROM ceragen.admin_expense_type 
                WHERE ext_state = true
            """
            return DataBaseHandle.getRecords(query, 0)
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def ExpenseTypeById(ext_id):
        try:
            query = """
                   SELECT ext_id, ext_name, ext_description, ext_state, 
                       user_created, to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created, 
                       user_modified, to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') as date_modified, 
                       user_deleted, to_char(date_deleted, 'DD/MM/YYYY HH24:MI:SS') as date_deleted 
                   FROM ceragen.admin_expense_type 
                   WHERE ext_id = %s
               """
            return DataBaseHandle.getRecords(query, 1, (ext_id,))
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def AddExpenseType(data):
        v_result = False
        v_message = None
        v_data = None
        try:
            sql = """
                   INSERT INTO ceragen.admin_expense_type (
                       ext_name, ext_description, ext_state, user_created, date_created
                   ) VALUES (%s, %s, %s, %s, %s)
                   RETURNING ext_id
               """
            record = (
                data["ext_name"],
                data["ext_description"],
                True,
                data["user_process"],
                datetime.now()
            )
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al insertar el tipo de gasto: {err}"
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def UpdateExpenseType(data):
        v_result = False
        v_message = None
        v_data = None
        try:
            sql = """
                    UPDATE ceragen.admin_expense_type 
                    SET ext_name = %s, ext_description = %s, 
                        user_modified = %s, date_modified = %s 
                    WHERE ext_id = %s
                """
            record = (
                data["ext_name"],
                data["ext_description"],
                data["user_process"],
                datetime.now(),
                data["ext_id"]
            )
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al actualizar tipo de gasto: {err}"
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def DeleteExpenseType(ext_id, user):
        try:
            sql = """
                    UPDATE ceragen.admin_expense_type 
                    SET ext_state = false, user_deleted = %s, date_deleted = %s 
                    WHERE ext_id = %s
                """
            record = (user, datetime.now(), ext_id)
            rows_affected = DataBaseHandle.ExecuteNonQuery(sql, record)
            HandleLogs.write_log("Filas afectadas: " + str(rows_affected))

            if rows_affected["data"] > 0:
                return True, f"Registro con ID {ext_id} eliminado exitosamente."
            else:
                return False, f"No se encontró ningún registro con ID {ext_id}."
        except Exception as err:
            HandleLogs.write_error(err)
            return None