from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.logs import HandleLogs
from ...Model.Response.Security.NotificationResponse import NotificationResponse
from ....utils.general.response import internal_response

#MODULO DE NOTICICAION
class NotificationComponent:
    @staticmethod
    def NotificationSend(data):
        try:
            HandleLogs.write_log(f"Enviando notificación con datos: {data}")
            sql = """
                        INSERT INTO ceragen.segu_user_notification (
                            sun_user_source_id,
                            sun_user_destination_id,
                            sun_title_notification,
                            sun_text_notification,
                            sun_date_notification,
                            sun_state_notification,
                            sun_isread_notification,
                            user_created,
                            date_created
                        ) VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP, %s, %s, %s, CURRENT_TIMESTAMP)
                        RETURNING sun_id;
                    """
            params = (
                data.get("sun_user_source_id"),
                data.get("sun_user_destination_id"),
                data.get("sun_title_notification"),
                data.get("sun_text_notification"),
                data.get("sun_state_notification", True),
                data.get("sun_isread_notification", False),
                data.get("user_created")
            )

            result = DataBaseHandle.ExecuteInsert(sql, params)

            if result.get("result"):
                return internal_response(
                    True,
                    "Notificación enviada exitosamente.",
                    {"sun_id": result["data"][0]["sun_id"]}
                )
            else:
                return internal_response(
                    False,
                    result.get("message", "Error al enviar la notificación."),
                    None
                )

        except Exception as e:
            HandleLogs.write_error(f"Error en NotificationSend: {str(e)}")
            return internal_response(False, "Error interno al enviar la notificación.", None)

    @staticmethod
    def NotificationsList(user_name):
        try:
            record = (user_name,)
            result = False
            message = None
            data = None
            sql = """SELECT 
                        s.sun_id,
                        s.sun_title_notification, 
                        s.sun_text_notification,
                        s.sun_isread_notification,
                        s.sun_date_notification,
                        su_dest.user_login_id AS recipient_login_id,
                        su_source.user_login_id AS sender_login_id   
                    FROM 
                        ceragen.segu_user_notification s
                    JOIN 
                        ceragen.segu_user su_dest
                    ON 
                        s.sun_user_destination_id = su_dest.user_id
                    JOIN 
                        ceragen.segu_user su_source
                    ON 
                        s.sun_user_source_id = su_source.user_id
                        WHERE 
                            su_dest.user_id = 1
                            AND s.sun_state_notification = true
                    ORDER BY 
                        s.sun_date_notification DESC;
                                        """

            resultado = DataBaseHandle.getRecords(sql,0,record)
            HandleLogs.write_log(resultado)
            if resultado['result'] is False:

                HandleLogs.write_error("Error no hay notifcaciones")
                message = "Error no hay notifcaciones"
            else:
                if resultado.__len__() > 0:
                    result = True
                    array_response = []
                    for registro in resultado['data']:
                        values = registro.values()
                        dato = NotificationResponse(*values).to_json()
                        array_response.append(dato)
                    data = array_response

                else:
                    message = "Error no existe esta persona"
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
    def NotificationsIsRead(notification_read, user_read, notification_id):
        try:
            record = (notification_read, user_read, notification_id)
            result = False
            message = None
            data = None
            sql = """UPDATE ceragen.segu_user_notification
            SET  sun_isread_notification = %s, sun_date_read_notification=timezone('America/Guayaquil', now()), user_modified=%s, date_modified=timezone('America/Guayaquil', now())
            WHERE sun_id = %s;"""

            resultado = DataBaseHandle.ExecuteNonQuery(sql,record)
            HandleLogs.write_log(resultado)
            if resultado['result'] is False:
                HandleLogs.write_error("Error no existe la notificacion")
                message = "Error no existe la notificacion"
            else:
                if resultado.__len__() > 0:
                    result = True
                    data = resultado['data']
                    HandleLogs.write_log(type(data))

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
    def NotificationDelete(del_id, user_read):
        try:
            record = (user_read, del_id)
            result = False
            message = None
            data = None
            sql = """UPDATE ceragen.segu_user_notification
            SET  sun_state_notification = true, user_deleted=%s, date_deleted=timezone('America/Guayaquil', now())
            WHERE sun_id = %s;"""

            resultado = DataBaseHandle.ExecuteNonQuery(sql,record)
            HandleLogs.write_log(resultado)
            if resultado['result'] is False:
                HandleLogs.write_error("Error no existe la notificacion")
                message = "Error no existe la notificacion"
            else:
                if resultado.__len__() > 0:
                    result = True
                    data = resultado['data']
                    HandleLogs.write_log(type(data))

        except Exception as err:
            HandleLogs.write_error(err)
            message = err.__str__()
        finally:
            return {
                'result': result,
                'message': message,
                'data': data
            }
