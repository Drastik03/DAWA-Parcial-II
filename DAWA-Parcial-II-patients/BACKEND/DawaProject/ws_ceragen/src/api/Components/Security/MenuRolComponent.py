from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle


class MenuRolComponent:
    @staticmethod
    def MenuRolList():
        try:
            result = False
            message = None
            data = None
            sql = """SELECT
                    smr.mr_id AS registro_id,
                    sm.menu_id AS menu_id,
                    sm.menu_name AS menu_name,
                    sr.rol_id AS rol_id,
                    sr.rol_name AS rol_name
                FROM
                    ceragen.segu_menu_rol smr
                JOIN
                    ceragen.segu_menu sm
                ON
                    smr.mr_menu_id = sm.menu_id
                JOIN
                    ceragen.segu_rol sr
                ON
                    smr.mr_rol_id = sr.rol_id
                WHERE
                    smr.mr_state = true;
                """

            resultado = DataBaseHandle.getRecords(sql, 0)
            HandleLogs.write_log(resultado)
            if resultado is None:

                HandleLogs.write_error("Error no Existen datos")
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
    def MenuRolDelete(id, user_name):

        try:
            record = (user_name, id)
            result = False
            message = None
            data = None
            sql = "UPDATE  ceragen.segu_menu_rol SET mr_state = false, user_deleted = %s, date_deleted= timezone('America/Guayaquil', now()) WHERE mr_id = %s"

            resultado = DataBaseHandle.ExecuteNonQuery(sql, record)
            HandleLogs.write_log(resultado)
            if resultado['data'] > 0:
                result = True
                data = resultado['data']
            else:
                message = "No existe  el recurso con el ID: " + str(id)
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
    def MenuRolUpdate(mr_id, rol_id, menu_id, user_name,):
         try:
             record = (menu_id,rol_id, user_name,mr_id,menu_id,rol_id)
             result = False
             message = None
             data = None
             sql = """UPDATE ceragen.segu_menu_rol
                         SET mr_menu_id = %s,mr_rol_id=%s, user_modified = %s, date_modified = timezone('America/Guayaquil', now())
                        WHERE mr_id = %s AND NOT EXISTS (SELECT 1
                        FROM ceragen.segu_menu_rol
                        WHERE mr_menu_id = %s
                          AND mr_rol_id = %s
                          );"""


             resultado = DataBaseHandle.ExecuteNonQuery(sql, record)
             HandleLogs.write_log(resultado)
             if resultado['data']:
                 result = True
                 data = resultado['data']
             else:
                 message = "No existe  el recurso con el ID: " + str(mr_id)
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
    def MenuRolInsert(menu_id, rol_id, user_name):
         try:
             record = (menu_id,rol_id, user_name, menu_id,rol_id)
             result = False
             message = None
             data = None
             sql = """INSERT INTO ceragen.segu_menu_rol
                        ( mr_menu_id, mr_rol_id, mr_state, user_created, date_created)
	                    SELECT %s, %s, True, %s, timezone('America/Guayaquil', now())
	                    WHERE NOT EXISTS (
                            SELECT 1
                            FROM ceragen.segu_menu_rol 
                            WHERE mr_menu_id = %s AND mr_rol_id=%s AND mr_state = true
                        )
	                    RETURNING mr_id;"""

             resultado = DataBaseHandle.ExecuteInsert(sql,record)

             HandleLogs.write_log(resultado)
             if resultado['data']:
                 result = True
                 value = resultado['data'][0]
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
