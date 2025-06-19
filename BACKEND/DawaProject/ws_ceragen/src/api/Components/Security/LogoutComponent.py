from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.logs import HandleLogs

class LogoutComponent:
    @staticmethod
    def Logoutupdate(logId):
        try:
            record = (logId,)
            result = False
            message = None
            data = None
            sql = """UPDATE ceragen.segu_login
                        SET slo_date_end_connection = timezone('America/Guayaquil', now())
                        WHERE slo_id = %s"""
            resultado = DataBaseHandle.ExecuteNonQuery(sql, record)
            HandleLogs.write_log(resultado)
            if resultado['data'] > 0:
                result = True
                data = resultado['data']
            else:
                message = "No existe  el recurso "
        except Exception as err:

            HandleLogs.write_error(err)
            message = err.__str__()

        finally:
            return {
                'result': result,
                'message': message,
                'data': data

            }