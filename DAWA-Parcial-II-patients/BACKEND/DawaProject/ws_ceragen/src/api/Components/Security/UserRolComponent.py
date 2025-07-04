from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.logs import HandleLogs
from .URCPComponent import urcpComponent

class UserRolComponent:
    @staticmethod
    def UserRolList():
        try:
            result = False
            message = None
            data = None
            sql = """SELECT 
                        ur.id_user_rol,
                        u.user_login_id AS user_login_id,
                        r.rol_name AS rol_name,
                        ur.id_user,
                        ur.id_rol
                    FROM 
                        ceragen.segu_user_rol ur
                    JOIN 
                        ceragen.segu_user u ON ur.id_user = u.user_id
                    JOIN 
                        ceragen.segu_rol r ON ur.id_rol = r.rol_id
                    WHERE 
                        ur.state = true AND 
                        u.user_state= true AND 
                        r.rol_state = true AND 
                        u.user_locked = false
                        ORDER BY ur.id_user_rol;"""

            resultado = DataBaseHandle.getRecords(sql, 0)

            if resultado is None:

                HandleLogs.write_error("Error no Existe  ")
                message = "Error  Menú"
            else:
                if resultado.__len__() > 0:
                    result = True
                    data = resultado['data']
                else:
                    message = "No existe    "
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
    def UserRolDelete(mr_id, user):
        try:
            record = (user, mr_id)
            result = False
            message = None
            data = None
            sql = "UPDATE ceragen.segu_user_rol SET state = false, user_deleted = %s, date_deleted= timezone('America/Guayaquil', now()) WHERE id_user_rol = %s"

            resultado = DataBaseHandle.ExecuteNonQuery(sql, record)
            HandleLogs.write_log(resultado)
            if  resultado['data'] > 0:
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
    def UserRolUpdate(user_rol_id, rol_id, user_id, user):
        try:
            record = (user_id, rol_id, user, user_rol_id, user_id, rol_id)
            result = False
            message = None
            data = None
            sql = """UPDATE ceragen.segu_user_rol
                      SET id_user = %s, id_rol = %s,  user_modified = %s, date_modified = timezone('America/Guayaquil', now())
                      WHERE id_user_rol = %s AND NOT EXISTS 
                      (SELECT 1 FROM ceragen.segu_menu_rol
                            WHERE id_user = %s AND id_rol = %s AND state = true
                        );"""


            resultado = DataBaseHandle.ExecuteNonQuery(sql, record)
            if resultado['data'] > 0:
                result = True
                data = resultado['data']
            else:
                message = "No existe  el recurso con el ID: " + str(user_rol_id)
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
    def UserRolInsert( rol_id, user_id,id_career_period, user):
        try:
            record = (user_id, rol_id, user, user_id,rol_id)
            result = False
            message = None
            data = None
            sql = """INSERT INTO ceragen.segu_user_rol(
                     id_user, id_rol, user_created, date_created,state)
                    SELECT %s,  %s,  %s,  timezone('America/Guayaquil', now()), true
                     WHERE NOT EXISTS (
                            SELECT 1
                            FROM ceragen.segu_user_rol 
                            WHERE id_user = %s AND  id_rol = %s AND state = true
                        )
                    RETURNING id_user_rol"""
            resultado = DataBaseHandle.ExecuteInsert(sql,record)
            HandleLogs.write_log(resultado)
            if resultado['data'] == []:
                message = "Existe registro: "
            else:
                result = True
                value = resultado['data'][0]
                data = list(value.values())[0]
                HandleLogs.write_log('ID_user_rol:'+str(data))
                HandleLogs.write_log(type(data))
                respuesta = urcpComponent.Userol_CarrerPeriodInsert(id_career_period,data,user)
        except Exception as err:
            HandleLogs.write_error(err)
            message = err.__str__()
        finally:
            return {
                'result': result,
                'message': message,
                'data': data
            }
