from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from datetime import datetime
from ....utils.general.response import internal_response

class AdminiesComponent:
    @staticmethod
    def ListAllIes():
        try:
            query = "select id, name, description, phone_number, address, manager_name, web_site, " \
                    "mail_address, state, user_created, to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created, " \
                    "user_modified, to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified, user_deleted, date_deleted " \
                    "from ceragen.admin_ies where state = true"
            res = DataBaseHandle.getRecords(query, 0)
            return res
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def GetIesById(id):
        try:
            query = "select id, name, description, phone_number, address, manager_name, web_site, " \
                    "mail_address, state, user_created, to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created, " \
                    "user_modified, to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified, user_deleted, date_deleted " \
                    "from ceragen.admin_ies where id = %s"
            record = (id,)
            res = DataBaseHandle.getRecords(query, 1, record)
            return res
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def Add_Ies(data_to_insert):

        try:
            v_message = None
            v_result = False
            v_data = None
            sql = "INSERT INTO ceragen.admin_ies( name, description, phone_number, address, " \
                  "manager_name, web_site, mail_address, state, user_created, date_created) " \
                  "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) "

            record = (data_to_insert['name'], data_to_insert['description'], data_to_insert['phone_number'],
                      data_to_insert['address'], data_to_insert['manager_name'],
                      data_to_insert['web_site'], data_to_insert['mail_address'], True,
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
    def Update_Ies(data_to_update):
        try:
            v_message = None
            v_result = False
            v_data = None
            sql = "UPDATE ceragen.admin_ies " \
                  "SET name=%s, description=%s, phone_number=%s, " \
                  "address=%s, manager_name=%s, web_site=%s, mail_address=%s, " \
                  "user_modified=%s, date_modified=%s " \
                  "WHERE id = %s"

            record = (data_to_update['name'], data_to_update['description'],
                      data_to_update['phone_number'], data_to_update['address'], data_to_update['manager_name'],
                      data_to_update['web_site'], data_to_update['mail_address'],
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
    def delete_Ies(id, p_user):
        try:
            #validas que no existan unidades academicas asociadas
            query1 = "SELECT count(*) as total FROM ceragen.admin_unit_academic " \
            "where id_ies = %s and state = true;"

            record1 = (id,)

            data_ua = DataBaseHandle.getRecords(query1, 1, record1)
            if data_ua['result']:
                if int(data_ua['data']['total']) > 0:
                    return False, "No se puede eliminar el registro porque existen Carreras Universitarias asociadas"
                else:

                    query = "UPDATE ceragen.admin_ies " \
                        "SET state = false, user_deleted = %s, date_deleted = %s WHERE id = %s"
                record = (p_user, datetime.now(), id)
                rows_affected = DataBaseHandle.ExecuteNonQuery(query, record)
                HandleLogs.write_log("Filas afectadas: " + str(rows_affected))

                if rows_affected['data'] > 0:
                    return True, f"Registro con ID {id} eliminado exitosamente."
                else:
                    return False, f"No se encontró ningún registro con ID {id}."

            else:
                return False, "Error al Buscar Unidades académicas asociadas " + str(data_ua['message'])

        except Exception as err:
            HandleLogs.write_error(err)
            return None
