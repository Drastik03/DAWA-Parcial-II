from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.logs import HandleLogs
from ...Model.Response.Security.PersonResponse import PersonResponse

class GetPersonComponent:
    @staticmethod
    def PersonDate():
        try:

            result = False
            message = None
            data = None
            sql = """SELECT
    p.per_id,
    p.per_identification,
    p.per_names,
    p.per_surnames,
    p.per_mail,
    CASE
        WHEN u.user_login_id IS NOT NULL AND u.user_state = true THEN true
        ELSE false
    END AS has_user,
    u.user_id,
    u.user_login_id,
    u.user_locked,
    u.user_state,
    u.user_last_login
FROM
    ceragen.admin_person p
LEFT JOIN
    ceragen.segu_user u
    ON p.per_id = u.user_person_id
WHERE
    p.per_state = true 
    
   
                    """
            resultado = DataBaseHandle.getRecords(sql, 0)
            HandleLogs.write_log(resultado)
            if resultado is None:

                HandleLogs.write_error("Error no existe esta persona")
                message = "Error no existe esta persona"
            else:
                if resultado.__len__() > 0:
                    result = True
                    array_response = []
                    for registro in resultado['data']:
                        values = registro.values()
                        dato = PersonResponse(*values).to_json()
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
