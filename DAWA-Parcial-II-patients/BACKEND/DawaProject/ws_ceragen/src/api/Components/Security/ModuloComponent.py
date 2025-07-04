from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.logs import HandleLogs


class ModuleComponent:
    @staticmethod
    def ModuleList():
        try:
            result = False
            message = None
            data = None
            sql ="SELECT mod_id, mod_name, mod_description, mod_order, mod_icon_name, mod_text_name FROM ceragen.segu_module WHERE mod_state = true"

            resultado = DataBaseHandle.getRecords(sql, 0)

            if resultado is None:

                HandleLogs.write_error("Error no Existe  Menu")
                message = "Error  Modulo"
            else:
                if resultado.__len__() > 0:
                    result = True
                    data = resultado['data']
                else:
                    message = "No existe  Modulo  "
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
    def ModuleDelete(id,user_name):

        try:
            record =(user_name,id)
            result = False
            message = None
            data = None
            sql ="UPDATE ceragen.segu_module SET mod_state = false, user_deleted = %s, date_deleted= timezone('America/Guayaquil', now()) WHERE mod_id = %s"
            HandleLogs.write_log(type(id))

            resultado = DataBaseHandle.ExecuteNonQuery(sql,record)
            HandleLogs.write_log(type(resultado))
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
    def ModuleUpdate(mod_name, mod_description, mod_order, mod_icon_name, user_name,mod_id):
        try:
            mod_text_name =  f"{mod_name}_{mod_order}"
            record = (mod_name,mod_description,mod_order,mod_icon_name,mod_text_name,user_name, mod_id)
            result = False
            message = None
            data = None
            sql = """UPDATE ceragen.segu_module
                        SET  mod_name=%s, mod_description=%s, mod_order=%s, mod_icon_name=%s, mod_text_name= %s , user_modified=%s, date_modified= timezone('America/Guayaquil', now())
                        WHERE mod_id = %s"""
            resultado = DataBaseHandle.ExecuteNonQuery(sql,record)
            HandleLogs.write_log(resultado)
            if resultado['data'] > 0:
                result = True
                data = resultado['data']
            else:
                message = "No existe  el recurso con el ID: " + str(mod_id)
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
    def ModuleInsert(mod_name, mod_description, mod_order, mod_icon_name, user_name):
        try:
            mod_text_name = f"{mod_name}_{mod_order}"
            record = (mod_name,mod_description,mod_order,mod_icon_name,mod_text_name,user_name,mod_name)
            result = False
            message = None
            data = None
            sql = """INSERT INTO ceragen.segu_module (
                            mod_name, mod_description, mod_order, mod_icon_name, mod_text_name, mod_state, user_created, date_created
                        ) 
                        SELECT
                            %s, %s, %s, %s, %s, True, %s, timezone('America/Guayaquil', now())
                        WHERE NOT EXISTS (
                            SELECT 1
                            FROM ceragen.segu_module 
                            WHERE mod_name = %s AND mod_state = true
                        )
                         RETURNING mod_id;"""

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