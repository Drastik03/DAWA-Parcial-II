from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from datetime import datetime
from flask import Flask, jsonify, request
from ....utils.general.response import internal_response

class CareerPeriodComponent:

    @staticmethod
    def list_all_career_periods():
        try:

            query = "SELECT cpe.ucp_id, per.name AS period_name, car.name AS career_name, cpe.ucp_state, cpe.user_created, " \
                    "to_char(cpe.date_created, 'DD/MM/YYYY HH24:MI:SS') AS date_created, cpe.user_modified, " \
                    "to_char(cpe.date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified, cpe.user_deleted, cpe.date_deleted " \
                    "FROM ceragen.admin_career_period cpe " \
                    "INNER JOIN ceragen.admin_period per ON per.id = cpe.ucp_id_period " \
                    "INNER JOIN ceragen.admin_university_career car ON car.id = cpe.ucp_id_career " \
                    "WHERE cpe.ucp_state = True"

            res = DataBaseHandle.getRecords(query, 0) 
            return res
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def get_career_period_by_id(ucp_id):
        try:
            query = "SELECT ucp_id, ucp_id_period, ucp_id_career, ucp_state, user_created, " \
                    "to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') AS date_created, user_modified, " \
                    "to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified, user_deleted, date_deleted " \
                    "FROM ceragen.admin_career_period WHERE ucp_id = %s"
            record = (ucp_id,)
            result = DataBaseHandle.getRecords(query, 1, record)

            return result  # retornoa null si no se euncuentra
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def add_career_period(data_to_insert):

        try:
            v_message = None
            v_result = False
            v_data = None
            sql = "INSERT INTO ceragen.admin_career_period( ucp_id_period, ucp_id_career, " \
	              "ucp_state, user_created, date_created) " \
	              "VALUES (%s,%s,%s,%s,%s) "

            record = (data_to_insert['ucp_id_period'], data_to_insert['ucp_id_career'],
                      True, data_to_insert['user_process'], datetime.now())

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
    def update_career_period(data_to_update):
        try:
            v_message = None
            v_result = False
            v_data = None
            sql = "UPDATE ceragen.admin_career_period " \
                  "SET ucp_id_period=%s, ucp_id_career=%s, " \
                  "user_modified=%s, date_modified=%s " \
                  "WHERE ucp_id = %s"

            record = (data_to_update['ucp_id_period'], data_to_update['ucp_id_career'],
                      data_to_update['user_process'], datetime.now(), data_to_update['ucp_id'])

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
    def delete_admin_period(ucp_id, p_user):
        try:
            query = "UPDATE ceragen.admin_career_period " \
                     "SET ucp_state = false, user_deleted = %s, date_deleted = %s WHERE ucp_id = %s"
            record = (p_user, datetime.now(), ucp_id)
            rows_affected = DataBaseHandle.ExecuteNonQuery(query, record)
            HandleLogs.write_log("Filas afectadas: " + str(rows_affected))

            if rows_affected['data'] > 0:
                return True, f"Registro con ID {ucp_id} eliminado exitosamente."
            else:
                return False, f"No se encontró ningún registro con ID {ucp_id}."
        except Exception as err:
            HandleLogs.write_error(err)
            return None
