
from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.logs import HandleLogs
from ...Model.Response.Security.RolSistemResponse import RolSistemResponse

class RolSistemComponent:
    @staticmethod
    def RolSistemList():
        try:
            result = False
            message = None
            data = None
            sql = "SELECT rol_id, rol_name, rol_description FROM ceragen.segu_rol  WHERE rol_state = TRUE "

            resultado = DataBaseHandle.getRecords(sql, 0)
            HandleLogs.write_log(resultado)
            if resultado is None:

                HandleLogs.write_error("Error no Existe  Roles")
                message = "Error  Menú"
            else:
                if resultado.__len__() > 0:
                    result = True
                    data = resultado['data']
                else:
                    message = "No existe  Roles  "
        except Exception as err:
            HandleLogs.write_error(err)
            message = err.__str__()
        finally:
            return {
                'result': result,
                'message': message,
                'data': data
            }
    @staticmethod
    def RolSistemDelete(id, user_name):

        try:
            record = (user_name, id)
            result = False
            message = None
            data = None
            sql = "UPDATE  ceragen.segu_rol SET rol_state = false, user_deleted = %s, date_deleted= timezone('America/Guayaquil', now()) WHERE rol_id = %s"

            resultado = DataBaseHandle.ExecuteNonQuery(sql, record)
            HandleLogs.write_log(resultado)
            if resultado['data'] is None:
                message = resultado['message']
            else:
                result = True
                data = resultado['data']
        except Exception as err:
            HandleLogs.write_error(err)
            message = err.__str__()
        finally:
            return {
                'result': result,
                'message': message,
                'data': data
            }

    @staticmethod
    def RolSistemUpdate(rol_name,rol_description, user_name, rol_id):
         try:
             record = ( rol_name,rol_description, user_name, rol_id)
             result = False
             message = None
             data = None
             sql = """UPDATE ceragen.segu_rol
                      SET rol_name = %s,rol_description=%s, user_modified = %s, date_modified = timezone('America/Guayaquil', now())
                      WHERE rol_id = %s"""


             resultado = DataBaseHandle.ExecuteNonQuery(sql, record)
             print(resultado)
             if resultado['data'] is None:
                message = resultado['message']
             else:
                 result = True
                 data = resultado['data']
         except Exception as err:

             HandleLogs.write_error(err)
             message = err.__str__()

         finally:
             return {
                 'result': result,
                 'message': message,
                 'data': data

             }

    @staticmethod
    def RolSistemInsert(rol_name,rol_description, user_name, ):
         try:
             record = ( rol_name,rol_description, user_name, rol_name )
             result = False
             message = None
             data = None
             sql = """INSERT INTO ceragen.segu_rol
                        ( rol_name, rol_description, rol_state, user_created, date_created)
	                    SELECT
	                    %s, %s, True, %s, timezone('America/Guayaquil', now())
	                   WHERE NOT EXISTS (
                            SELECT 1
                            FROM ceragen.segu_rol 
                            WHERE rol_name = %s AND rol_state = true
                        ) 
	                    RETURNING  rol_id;
	                    """
             resultado = DataBaseHandle.ExecuteInsert(sql,record)

             HandleLogs.write_log(resultado)

             if resultado['data']:
                 value = resultado['data'][0]
                 result = True
                 data = list(value.values())[0]
             else:
                 message = resultado['message']

         except Exception as err:
             HandleLogs.write_error(err)
             message = err.__str__()
         finally:
             return {
                 'result': result,
                 'message': message,
                 'data': data
             }