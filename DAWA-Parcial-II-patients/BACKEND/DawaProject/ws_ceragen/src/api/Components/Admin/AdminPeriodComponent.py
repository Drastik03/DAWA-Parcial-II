from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from datetime import datetime
from flask import Flask, jsonify, request
from ....utils.general.response import internal_response

class Periodcomponent:
    @staticmethod
    def ListAllPerido():
        try:
            query = "SELECT per.id, per.name, per.description, per.anio, cic.value as value, per.is_active_period, " \
                    "per.state, per.user_created, to_char(per.date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created, " \
                    "per.user_modified, to_char(per.date_modified, 'DD/MM/YYYY HH24:MI:SS') as date_modified, " \
                    "per.user_deleted, per.date_deleted " \
                    "FROM ceragen.admin_period per " \
                    "INNER JOIN ceragen.admin_cicle cic on cic.id = per.ciclo_id " \
                    "where per.state = true;"
            res = DataBaseHandle.getRecords(query, 0)
            return res
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def GetPeriodById(id):
        try:
            query = "SELECT id, name, description, anio, ciclo_id, is_active_period, state, " \
                    "user_created, to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created, " \
                    "user_modified, date_modified, user_deleted, date_deleted " \
                    "FROM ceragen.admin_period where id = %s"
            record = (id,)
            res = DataBaseHandle.getRecords(query, 1, record)
            return res
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    def AddPeriod(data_to_insert):

        try:
            v_message = None
            v_result = False
            v_data = None
            sql = "INSERT INTO ceragen.admin_period( name, description, anio, ciclo_id, " \
	              "is_active_period, state, user_created, date_created) " \
	              "VALUES (%s,%s,%s,%s,%s,%s,%s,%s) " \
                  "RETURNING id"

            record = (data_to_insert['name'], data_to_insert['description'], data_to_insert['anio'],
                      data_to_insert['ciclo_id'], True, True,
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

    def UpdatePeriod(data_to_update):
        try:
            v_message = None
            v_result = False
            v_data = None
            HandleLogs.write_log((data_to_update))
            sql = "UPDATE ceragen.admin_period " \
	              "SET name=%s, description=%s, anio=%s, ciclo_id=%s," \
                  "user_modified=%s, date_modified=%s " \
	              "WHERE id = %s"

            record = (data_to_update['name'], data_to_update['description'],
                      data_to_update['anio'], data_to_update['value'],
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
    def DeletePeriod(id, p_user):
        try:
            print(p_user)
            query = "UPDATE ceragen.admin_period " \
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
