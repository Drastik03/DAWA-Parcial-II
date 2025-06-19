from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.response import internal_response

class RolComponent:
    @staticmethod
    def getUserRol(p_id_user):
        try:
            result = False
            message = None
            data = None
            sql = "select sr.rol_id, sr.rol_name, sr.rol_description, sr.is_admin_rol " \
                  "from ceragen.segu_rol sr " \
                  "inner join ceragen.segu_user_rol ur on sr.rol_id = ur.id_rol " \
                  "where ur.id_user = %s " \
                  "and sr.rol_state = true and ur.state = true;"

            record = (p_id_user, )
            resultado = DataBaseHandle.getRecords(sql, 0, record)
            if resultado is None:
                HandleLogs.write_error("Error al Buscar roles para usuario: " + str(p_id_user))
                message = "Error al Buscar roles para usuario, Id: " + str(p_id_user)
            else:
                if resultado.__len__() > 0:
                    result = True
                    data = resultado['data']
                else:
                    message = "No existe Rol asignado para usuario: " + p_id_user
        except Exception as err:
            HandleLogs.write_error(err)
        finally:
            return internal_response(result, message, data)


    @staticmethod
    def getCarrerPeriodRol(p_id_rol, p_id_user):
        try:
            result = False
            message = None
            data = None
            sql = """select acp.ucp_id as career_period,ap.id as period_id, ap.name as period_name, ap.anio as period_anio, 
                ap.is_active_period, ac.id as cicle_id, ac.value as cicle_name, 
                uc.id as career_id, uc.name as career_name, 
                urcp_id as user_rol_career_period_id, sur.id_user_rol as user_rol_id ,
				au.name as name_facult, au.id as id_facult
                from ceragen.segu_user_rol_career_period urc 
                inner join ceragen.segu_user_rol sur on sur.id_user_rol = urc.urcp_id_user_rol 
                inner join ceragen.admin_career_period acp on acp.ucp_id = urc.urcp_career_period_id 
                inner join ceragen.admin_university_career uc on uc.id = ucp_id_career 
                inner join ceragen.admin_period ap on ap.id = ucp_id_period 
                inner join ceragen.admin_cicle ac on ac.id = ap.ciclo_id 
				inner join ceragen.admin_academy_unit au on au.id = uc.id_academic_unit 
                where urcp_state = true and sur.state = true and ucp_state = true 
                and uc.state = true and ap.state = true and ac.state = true 
                and sur.id_rol = %s and sur.id_user = %s
                 ORDER BY is_active_period  DESC"""

            record = (p_id_rol, p_id_user)
            resultado = DataBaseHandle.getRecords(sql, 0, record)
            if resultado is None:
                HandleLogs.write_error("Error al Buscar Carrera y Perioro para el Usuario: " + str(p_id_user))
                message = "Error al Buscar Carrera y Perioro para el Usuario: " + str(p_id_user)
            else:
                if resultado.__len__() > 0:
                    result = True
                    data = resultado['data']
                else:
                    message = "No existe Carrera y Perioro para el Usuario: " + str(p_id_user)
        except Exception as err:
            HandleLogs.write_error(err)
        finally:
            return internal_response(result, message, data)