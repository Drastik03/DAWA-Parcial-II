from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.response import internal_response

class ModuleComponent:
    @staticmethod
    def getModuleRol(p_id_rol):
        try:
            result = False
            message = None
            data = None
            sql = "select distinct mod_id, mod_name, mod_description, mod_order, mod_icon_name, " \
                "mod_text_name from ceragen.segu_menu men " \
                "inner join ceragen.segu_menu_rol smr on smr.mr_menu_id = men.menu_id " \
                "inner join ceragen.segu_module mdl on mdl.mod_id = men.menu_module_id " \
                "where smr.mr_rol_id = %s and smr.mr_state = true " \
                "and mdl.mod_state = true and men.menu_state = true " \
                "order by mod_order;"

            record = (p_id_rol, )
            resultado = DataBaseHandle.getRecords(sql, 0, record)

            if resultado is None:
                HandleLogs.write_error("Error al Buscar Modulos de Menú para Rol: " + str(p_id_rol))
                message = "Error al buscar Modulos de Menú para Rol: " + str(p_id_rol)
            else:
                if resultado.__len__() > 0:
                    result = True
                    data = resultado['data']
                else:
                    message = "No existen Modulos de Menú para Rol: " + str(p_id_rol)
        except Exception as err:
            HandleLogs.write_error(err)
        finally:
            return internal_response(result, message, data)