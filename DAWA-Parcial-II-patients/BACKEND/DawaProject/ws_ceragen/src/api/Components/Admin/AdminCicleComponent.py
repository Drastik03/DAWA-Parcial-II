from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.logs import HandleLogs
from datetime import datetime
from ....utils.general.response import internal_response
class AdminCicleComponent:
    @staticmethod
    def list_all_admin_cycles():
        try:
            query = "select id, value, state, user_created, " \
                    "to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created, " \
                    "user_modified, to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified, " \
                    "user_deleted, to_char(date_deleted, 'DD/MM/YYYY HH24:MI:SS') AS date_deleted " \
                    "from ceragen.admin_cicle where state = true"
            result = DataBaseHandle.getRecords(query, 0)
            return result # Devuelve una lista de objetos de ciclos
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def get_admin_cycle_by_id(id):
        try:
            query = "select id, value, state, user_created, " \
                    "to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created, " \
                    "user_modified, to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified, " \
                    "user_deleted, date_deleted " \
                    "from ceragen.admin_cicle where id = %s and state = true"
            record = (id,)
            result = DataBaseHandle.getRecords(query, 1, record)
            return result
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def add_admin_cycle(data_to_insert):

        try:
            v_message = None
            v_result = False
            v_data = None
            sql = "INSERT INTO ceragen.admin_cicle(value, state, user_created, date_created) " \
                  "VALUES (%s, %s, %s, %s)"

            record = (data_to_insert['value'], True,
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
    def update_admin_cycle(data_to_update):
        try:
            v_message = None
            v_result = False
            v_data = None
            sql = "UPDATE ceragen.admin_cicle " \
                  "SET value=%s, state=%s, " \
                  "user_modified=%s, date_modified=%s " \
                  "WHERE id = %s"
            record = (data_to_update['value'], True,
                      data_to_update['user_process'], datetime.now(), data_to_update['id'])

            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)

            if v_data is not None:
                v_result = True

        except Exception as err:
            HandleLogs.write_error(err)
            v_message = "Error al Actualizar registro: " + str(err)
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def delete_admin_cicle(id, p_user):
        try:
            query = "UPDATE ceragen.admin_cicle " \
                     "SET state = false, user_deleted = %s, date_deleted = %s WHERE id = %s"
            record = (p_user, datetime.now(), id)
            rows_affected = DataBaseHandle.ExecuteNonQuery(query, record)
            HandleLogs.write_log("Filas afectadas: " + str(rows_affected))

            if rows_affected['data'] > 0:
                return True, f"Registro con ID {id} eliminado exitosamente."
            else:
                return False, f"No se encontró ningún registro con ID {id}."
        except Exception as err:
            HandleLogs.write_error(err)
            return None

