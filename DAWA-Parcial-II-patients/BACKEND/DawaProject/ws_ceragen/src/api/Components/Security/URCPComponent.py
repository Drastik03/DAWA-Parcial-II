
from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle

class urcpComponent:
    @staticmethod
    def Userol_CarrerPeriodList():
        try:
            result = False
            message = None
            data = None
            sql = """SELECT
                            ucrp.urcp_id AS id ,
                            cp.ucp_id AS CareerPeriod_id ,
                            carrera.name AS Carrera,
                            periodo.name AS Periodo,
                            sur.id_user_rol AS UserRol_id,
                            su.user_login_id AS Usuario,
                            sr.rol_name AS Rol
                           
                        FROM
                            ceragen.segu_user_rol_career_period ucrp
                        JOIN
                            ceragen.admin_career_period cp 
                            ON ucrp.urcp_career_period_id = cp.ucp_id 
                            AND cp.ucp_state = true
                        JOIN
                            ceragen.admin_university_career carrera 
                            ON  cp.ucp_id_career = carrera.id 
                            AND carrera.state = true
                        JOIN
                            ceragen.admin_period periodo 
                            ON  cp.ucp_id_period = periodo.id 
                            AND periodo.is_active_period = true
                        JOIN
                            ceragen.segu_user_rol sur 
                            ON ucrp.urcp_id_user_rol = sur.id_user_rol 
                            AND sur.state = true
                        JOIN
                            ceragen.segu_user su 
                            ON	sur.id_user = su.user_id 
                            AND su.user_state = true 
                            AND su.user_locked = false
                        JOIN
                            ceragen.segu_rol sr 
                            ON	sur.id_rol = sr.rol_id 
                            AND sr.rol_state = true
                            
                            WHERE ucrp.urcp_state = true"""

            resultado = DataBaseHandle.getRecords(sql, 0)
            HandleLogs.write_log(resultado)
            if resultado['data'] is None:
                result = False
                message = "Error al Busar Datos"

                HandleLogs.write_error("Error al Busar Datos")
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

    def Userol_CarrerPeriodActive(id_unit):
        try:
            result = False
            message = None
            data = None
            sql = """SELECT
                        cp.ucp_id AS id,
                        pe.name AS periodo,
                        ca.name AS carrera
                    FROM
                        ceragen.admin_career_period cp
                    JOIN
                        ceragen.admin_university_career ca 
                        ON cp.ucp_id_career = ca.id
                        AND ca.id_academic_unit = %s
                        AND ca.state = true
                    JOIN
                        ceragen.admin_period pe 
                        ON cp.ucp_id_period = pe.id
                        AND pe.state = true
                        AND pe.is_active_period = true
                    WHERE
                        cp.ucp_state = true;
                    """

            resultado = DataBaseHandle.getRecords(sql, 0,(id_unit,))
            HandleLogs.write_log(resultado)
            if resultado['data'] is None:
                result = False
                message = "Error al Busar Datos"

                HandleLogs.write_error("Error al Busar Datos")
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

    def Userol_CarrerPeriodInsert( id_career_period,id_user_rol,user_id):
        try:
            record = (id_user_rol,id_career_period,user_id,id_user_rol,id_career_period)
            result = False
            message = None
            data = None
            sql = """INSERT INTO ceragen.segu_user_rol_career_period(
                      urcp_id_user_rol, urcp_career_period_id, urcp_state, user_created, date_created)
                    SELECT %s,  %s, true,  %s,  timezone('America/Guayaquil', now())
                     WHERE NOT EXISTS (
                            SELECT 1
                            FROM ceragen.segu_user_rol_career_period 
                            WHERE urcp_id_user_rol = %s 
                            AND urcp_career_period_id = %s 
                            AND urcp_state = true
                        )
                    RETURNING urcp_id"""
            resultado = DataBaseHandle.ExecuteInsert(sql, record)
            HandleLogs.write_log(resultado)
            if resultado['data']:
                result = True
                value = resultado['data'][0]
                data = list(value.values())[0]
                message = "Asignacion de Carera-Periodo"

            else:
                message = "Existe registro "
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
    def Userol_CarrerPeriodDelete(mr_id, user):
        try:
            record = (user, mr_id)
            result = False
            message = None
            data = None
            sql = "UPDATE ceragen.segu_user_rol_career_period SET urcp_state = false, user_deleted = %s, date_deleted= timezone('America/Guayaquil', now()) WHERE urcp_id = %s"

            resultado = DataBaseHandle.ExecuteNonQuery(sql, record)
            HandleLogs.write_log(resultado)
            if resultado['data'] > 0:
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
    def Userol_CarrerPeriodUpdate(id_career_period,user, urcp_id):
        try:
            record = (id_career_period,user, urcp_id)
            result = False
            message = None
            data = None
            sql = ("UPDATE ceragen.segu_user_rol_career_period "
                   "SET urcp_career_period_id  = %s, "                   
                   "user_modified = %s, "
                   "date_modified = timezone('America/Guayaquil', now()) "
                   "WHERE "
                   "urcp_id = %s")

            resultado = DataBaseHandle.ExecuteNonQuery(sql, record)
            HandleLogs.write_log(resultado)
            if resultado['data'] > 0:
                result = True
                data = resultado['data']
            else:
                message = "No existe  el recurso con el ID: " + str(urcp_id)
        except Exception as err:
            HandleLogs.write_error(err)
            message = err.__str__()
        finally:
            return {
                'result': result,
                'message': message,
                'data': data
            }
