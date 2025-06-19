from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.logs import HandleLogs

from ...Model.Response.Security.MenuResponse import MenuResponse
from ....utils.general.response import internal_response

class MenuComponent:
    @staticmethod
    def List():
        try:
            respuesta = False
            sql = """SELECT
                        m.menu_id,
                        m.menu_name,
                        m.menu_order,
                        m.menu_icon_name,
                        m.menu_url,
                        m.menu_href,
                        mod.mod_name AS module_name,
                        r.rol_name,
                        m.menu_key
                    FROM
                        ceragen.segu_menu m
                    JOIN
                        ceragen.segu_module mod ON m.menu_module_id = mod.mod_id
                    LEFT JOIN
                        ceragen.segu_menu_rol mr ON m.menu_id = mr.mr_menu_id
                    LEFT JOIN
                        ceragen.segu_rol r ON mr.mr_rol_id = r.rol_id
                    WHERE
                        m.menu_state = true
                    ORDER BY
                        m.menu_order"""
            resultado = DataBaseHandle.getRecords(sql, 0)

            if resultado is None:
                HandleLogs.write_error("Error al Busar Datos de Usuarios")
            else:
                # Formatear la respuesta
                array_response = []
                for registro in resultado:
                    values = registro.values()
                    dato = MenuResponse(*values).to_json()

                    array_response.append(dato)

                respuesta = array_response
                HandleLogs.write_log(respuesta)
        except Exception as err:
            HandleLogs.write_error(err)
        finally:
            return respuesta
    @staticmethod
    def getMenuRolModule(p_id_rol, p_module_id):
        try:
            result = False
            message = None
            data = None
            sql = "select menu_id, menu_name, menu_order, menu_icon_name, " \
            "menu_icon_name, menu_href, menu_url, menu_key, menu_parent_id " \
            "from ceragen.segu_menu men " \
            "inner join ceragen.segu_menu_rol smr on smr.mr_menu_id = men.menu_id " \
            "inner join ceragen.segu_module mdl on mdl.mod_id = men.menu_module_id " \
            "where smr.mr_rol_id = %s and smr.mr_state = true " \
            "and mdl.mod_state = true and men.menu_state = true " \
            "and mdl.mod_id = %s order by menu_order;"

            record = (p_id_rol, p_module_id)
            resultado = DataBaseHandle.getRecords(sql, 0, record)

            if resultado is None:
                HandleLogs.write_error("Error al Buscar Opciones de Menú Para Módulo: " + str(p_module_id))
                message = "Error al Buscar Opciones de Menú Para Módulo: " + str(p_module_id)
            else:
                if resultado.__len__() > 0:
                    result = True
                    data = resultado['data']
                    HandleLogs.write_log(data)
                    HandleLogs.write_log(data.__len__())
                    for item in data:
                        menu_id = item['menu_id']
                        print(f"menu_id: {menu_id}")
                        submenu = MenuComponent.getSubMenu(menu_id)
                        item['submenu'] = submenu['data']

                else:
                    message = "No existen opciones de menú Para Módulo: " + str(p_module_id)
        except Exception as err:
            HandleLogs.write_error(err)
        finally:
            return internal_response(result, message, data)



    @staticmethod
    def getSubMenu(menuId):
        try:
            result = False
            message = None
            data = None
            sql = """SELECT menu_id, menu_name, menu_order, menu_icon_name, 
                        menu_icon_name, menu_href, menu_url, menu_key, menu_parent_id
                        FROM ceragen.segu_menu 
                        WHERE menu_parent_id = %s
                        order by  menu_parent_id,menu_order;
                        """

            record = (menuId,)
            resultado = DataBaseHandle.getRecords(sql, 0, record)
            HandleLogs.write_log
            if resultado is None:
                HandleLogs.write_error("Error al Buscar Opciones de Menú Para: " + str(menuId))
                message = "Error al Buscar Opciones de Menú Para: " + str(menuId)
            else:
                if resultado.__len__() > 0:
                    result = True
                    data = resultado['data']
                    HandleLogs.write_log(data)

                else:
                    message = "No existen opciones de menú Para: " + str(menuId)
        except Exception as err:
            HandleLogs.write_error(err)
        finally:
            return internal_response(result, message, data)

