from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.logs import HandleLogs

class ComponentMenu:
    @staticmethod
    def MenuList():
           try:
                   result = False
                   message = None
                   data = None
                   sql = """SELECT m.menu_id, 
                                   m.menu_name, 
                                   m.menu_order, 
                                   m.menu_module_id, 
                                   mm.mod_name AS menu_module_name,
                                   m.menu_parent_id, 
                                   p.menu_name AS menu_parent_name,
                                   m.menu_icon_name, 
                                   m.menu_href, 
                                   m.menu_url, 
                                   m.menu_key
                            FROM ceragen.segu_menu m
                            LEFT JOIN ceragen.segu_menu p ON m.menu_parent_id = p.menu_id
                            LEFT JOIN ceragen.segu_module mm ON m.menu_module_id = mm.mod_id
                            WHERE m.menu_state = true
                            ORDER BY m.menu_order;"""

                   resultado = DataBaseHandle.getRecords(sql, 0)

                   HandleLogs.write_log("List")
                   HandleLogs.write_log(resultado)

                   if resultado is None:

                       HandleLogs.write_error("Error no Existe  Menu" )
                       message = "Error  Menú"
                   else:
                       if resultado.__len__() > 0:
                           result = True
                           data = resultado['data']
                       else:
                           message = "No existe  Menú  "
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
    def MenuDelete(id, user_name):

        try:
            record = (user_name, id)
            result = False
            message = None
            data = None
            sql = "UPDATE ceragen.segu_menu SET menu_state = false, user_deleted = %s, date_deleted= timezone('America/Guayaquil', now()) WHERE menu_id = %s"

            resultado = DataBaseHandle.ExecuteNonQuery(sql,record)
            HandleLogs.write_log("delete")
            HandleLogs.write_log(resultado)
            if resultado['data'] > 0:
                result = True
                data = resultado['data']
            else:
                message = "No existe  el recurso con el ID: "+str(id)
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
    def MenuUpdate( menu_name, menu_order, menu_module_id, menu_parent_id, menu_icon_name, menu_href, menu_url,user_name,menu_id):
         try:
             if menu_parent_id == 0: menu_parent_id = None
             menu_key = f"{menu_name}_{menu_order}"
             record = ( menu_name, menu_order, menu_module_id, menu_parent_id, menu_icon_name, menu_href, menu_url,menu_key,user_name,menu_id)
             result = False
             message = None
             data = None
             sql = """UPDATE ceragen.segu_menu
                      SET menu_name = %s, menu_order = %s, menu_module_id = %s, menu_parent_id = %s, menu_icon_name = %s, menu_href = %s, menu_url = %s, menu_key = %s , user_modified = %s, date_modified = timezone('America/Guayaquil', now())
                      WHERE menu_id = %s"""
             resultado = DataBaseHandle.ExecuteNonQuery(sql, record)
             HandleLogs.write_log("update")
             HandleLogs.write_log(resultado)
             if resultado['data'] > 0:
                 result = True
                 data = resultado['data']
             else:
                 message = "No existe  el recurso con el ID: " + str(menu_id)
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
    def MenuInsert(menu_name, menu_order, menu_module_id, menu_parent_id, menu_icon_name, menu_href, menu_url,user_name):
        try:
            if menu_parent_id == 0: menu_parent_id = None
            menu_key = f"{menu_name}_{menu_order}"
            record = ( menu_name, menu_order, menu_module_id, menu_parent_id, menu_icon_name, menu_href, menu_url,menu_key, user_name,menu_name)
            result = False
            message = None
            data = None
            sql = """INSERT INTO ceragen.segu_menu( menu_name, menu_order, menu_module_id, menu_parent_id, menu_icon_name, menu_href, menu_url, menu_key, menu_state, user_created, date_created) 
                      SELECT %s, %s, %s, %s, %s,%s,%s, %s, true, %s, timezone('America/Guayaquil', now())
                      WHERE NOT EXISTS (
                            SELECT 1
                            FROM ceragen.segu_menu 
                            WHERE menu_name = %s AND menu_state = true 
                        )
                        RETURNING menu_id"""
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

