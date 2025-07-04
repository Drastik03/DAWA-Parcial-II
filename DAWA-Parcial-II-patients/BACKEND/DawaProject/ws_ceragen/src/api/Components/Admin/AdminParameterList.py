from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from datetime import datetime, date
from flask import Flask, jsonify, request
from ....utils.general.response import internal_response
import json
from decimal import Decimal

class ParameterListcomponent:
    @staticmethod
    def ListAllParameterList():
        try:
            query = "select pli_id, pli_code_parameter, pli_is_numeric_return_value, pli_string_value_return, " \
                    "pli_numeric_value_return, pli_state, user_created, to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created, " \
                    "user_modified, date_modified, user_deleted, date_deleted " \
                    "FROM ceragen.admin_parameter_list WHERE pli_state = true"
            res = DataBaseHandle.getRecords(query, 0)
            return json.loads(json.dumps(res, default=ParameterListcomponent.json_serial))
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def GetParameter_list_ById(pli_id):
        try:
            query = "select pli_id, pli_code_parameter, pli_is_numeric_return_value, pli_string_value_return, " \
                    "pli_numeric_value_return , pli_state, user_created, to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created, " \
                    "user_modified, date_modified, user_deleted, date_deleted " \
                    "FROM ceragen.admin_parameter_list WHERE pli_state = %s"
            record = (pli_id,)
            res = DataBaseHandle.getRecords(query, 1, record)
            return res
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def AddParameterList(data_to_insert):

        try:
            print(data_to_insert)
            v_message = None
            v_result = False
            v_data = None
            sql = "INSERT INTO ceragen.admin_parameter_list(pli_code_parameter, pli_is_numeric_return_value, " \
                  "pli_string_value_return, pli_numeric_value_return, pli_state, user_created, date_created) " \
                  "VALUES (%s, %s, %s, %s, %s, %s, %s)"

            record = (data_to_insert['pli_code_parameter'], True, data_to_insert['pli_string_value_return'],
                      data_to_insert['pli_numeric_value_return'], True,
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
    def UpdateParameterList(data_to_update):
        try:
            v_message = None
            v_result = False
            v_data = None
            sql = "UPDATE ceragen.admin_parameter_list " \
	              "SET pli_code_parameter=%s, pli_string_value_return=%s, " \
                  "pli_numeric_value_return=%s, user_modified=%s, date_modified=%s " \
	              "WHERE pli_id = %s"

            record = (data_to_update['pli_code_parameter'], data_to_update['pli_string_value_return'],
                      data_to_update['pli_numeric_value_return'],
                      data_to_update['user_process'], datetime.now(), data_to_update['pli_id'])

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
    def DeleteParamaterList(pli_id, p_user):
        try:
            query = "UPDATE ceragen.admin_parameter_list " \
                     "SET pli_state = false, user_deleted = %s, date_deleted = %s WHERE pli_id = %s"
            record = (p_user, datetime.now(), pli_id)
            rows_affected = DataBaseHandle.ExecuteNonQuery(query, record)
            HandleLogs.write_log("Filas afectadas: " + str(rows_affected))

            if rows_affected > 0:
                return True, f"Registro con ID {pli_id} eliminado exitosamente."
            else:
                return False, f"No se encontró ningún registro con ID {pli_id}."
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    def json_serial(obj):
        """JSON serializer for objects not serializable by default json code"""
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return obj.__str__()
        raise TypeError("Type %s not serializable" % type(obj))
