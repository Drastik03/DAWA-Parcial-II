from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle


class LoginDataComponent:
    @staticmethod
    def loginData(user_id, token, origen_ip, host):
        try:
            result = False
            message = None
            data = None
            sql = """INSERT INTO ceragen.segu_login ( slo_user_id, slo_token, slo_origin_ip, slo_host_name, slo_date_start_connection )
                      VALUES (
                            (SELECT user_id FROM ceragen.segu_user WHERE user_login_id = %s), %s, %s, %s, timezone('America/Guayaquil', now())
                            ) RETURNING  slo_id"""
            record = (user_id, token, origen_ip, host)
            resultado = DataBaseHandle.ExecuteInsert(sql,record)
            HandleLogs.write_log("register sql id of user:")
            value = resultado['data'][0]
            if list(value.values())[0] > 0:
                data = list(value.values())[0]
            else:
                message = "Error : no se puede insertar el registro"

        except Exception as err:
            HandleLogs.write_error(err)
            message = err.__str__()
        finally:
            return {
                'result': result,
                'message': message,
                'data': data
            }
