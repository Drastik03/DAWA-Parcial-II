
from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from datetime import datetime
from ....utils.general.response import internal_response
class MaritalStatuscomponent:
    @staticmethod
    def ListAllMaritalStatus():
        try:
            query = "select id, status_name, state, user_created, " \
                    "to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created, " \
                    "user_modified, to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') as date_modified, " \
                    "user_deleted, date_deleted " \
                    "FROM ceragen.admin_marital_status where state = true"
            res = DataBaseHandle.getRecords(query, 0)
            return res
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def GetMaritalStatusById(id):
        try:
            query = "select id, status_name, state, user_created, " \
                    "to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created, " \
                    "user_modified, date_modified, user_deleted, date_deleted " \
                    "FROM ceragen.admin_marital_status where id = %s"
            record = (id,)
            res = DataBaseHandle.getRecords(query, 1, record)
            return res
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def AddMaritalStatus(data_to_insert):

        try:
            v_message = None
            v_result = False
            v_data = None
            sql = "INSERT INTO ceragen.admin_marital_status( status_name, " \
                  "state, user_created, date_created) " \
                  "VALUES (%s,%s,%s,%s) "

            record = (data_to_insert['status_name'], True,
                      data_to_insert['user_process'], datetime.now())

            # Execute the UPDATE query
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True

        except Exception as err:
            HandleLogs.write_error(err)
            v_message = "Error al Actualizar registro: " + str(err)
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def UpdateMaritalStatus(data_to_update):
        try:
            v_message = None
            v_result = False
            v_data = None
            sql = "UPDATE ceragen.admin_marital_status " \
	              "SET status_name=%s, " \
                  "user_modified=%s, date_modified=%s " \
	              "WHERE id = %s"

            record = (data_to_update['status_name'],
                      data_to_update['user_process'], datetime.now(), data_to_update['id'])

            # Execute the UPDATE query
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True

        except Exception as err:
            HandleLogs.write_error(err)
            v_message = "Error al Actualizar registro: " + str(err)
        finally:
            return internal_response(v_result, v_message, v_data)


    @staticmethod
    def DeleteMaritalStatus(id, p_user):
        try:
            query = "UPDATE ceragen.admin_marital_status " \
                     "SET state = false, user_deleted = %s, date_deleted = %s WHERE id = %s"
            record = (p_user, datetime.now(), id)
            rows_affected = DataBaseHandle.ExecuteNonQuery(query, record)
            HandleLogs.write_log("Filas afectadas: " + str(rows_affected))

            if rows_affected > 0:
                return True, f"Registro con ID {id} eliminado exitosamente."
            else:
                return False, f"No se encontró ningún registro con ID {id}."
        except Exception as err:
            HandleLogs.write_error(err)
            return None
