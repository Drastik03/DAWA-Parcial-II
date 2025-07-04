from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from ....api.Model.Response.Audit.AudtSQLResponse import AuditSQLResponse
from datetime import datetime
class AuditComponent:
    @staticmethod
    def TablaAuditSQL():

        try:
            result = False
            message = None
            data = None

            sql ="""SELECT
                        a.ser_id,
                        t.aut_table_name AS table_name,
                        a.ser_sql_command_type,
                        a.ser_new_record_detail,
                        a.ser_old_record_detail,
                        u.user_login_id AS user_name,
                        a.ser_date_event
                    FROM
                        ceragen.audi_sql_events_register a
                    JOIN
                        ceragen.audi_tables t ON a.ser_table_id = t.aut_id
                    JOIN
                        ceragen.segu_user u ON a.ser_user_process_id = u.user_id;
                    """
            answer = DataBaseHandle.getRecords(sql, 0)

            if answer['data'] is not None:
                result = True
                message = answer['message']
                array_response = []
                for registro in answer['data']:
                    values = registro.values()
                    dato = AuditSQLResponse(*values).to_json()
                    array_response.append(dato)
                data = array_response

        except Exception as err:
            HandleLogs.write_error(err)
            message = err.__str__()
        finally:
            return {
                'result': result,
                'message': message,
                'data': data
            }


