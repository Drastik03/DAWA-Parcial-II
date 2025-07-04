from ....utils.common.convert_float import convert_decimal_to_float
from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.logs import HandleLogs
from ....utils.general.response import internal_response,response_success,response_error
from datetime import datetime


class TherapySessionControlComponent:

    @staticmethod
    def getAllTherapySessionsControl():
        try:
            HandleLogs.write_log(
                "Obteniendo todas las sesiones de control de terapia activas desde la DB (TherapySessionControlComponent).")
            sql = """
                    SELECT
                        s.sec_id AS sec_id,
                        s.sec_ses_number AS sec_ses_number,
                        TO_CHAR(s.sec_ses_agend_date, 'DD/MM/YYYY HH24:MI:SS') AS sec_ses_agend_date,
                        TO_CHAR(s.sec_ses_exec_date, 'DD/MM/YYYY HH24:MI:SS') AS sec_ses_exec_date,
                        s.ses_consumed AS ses_consumed,
                    
                        p.pro_name AS pro_name,
                        p.pro_total_sessions AS pro_total_sessions,
                        p.pro_duration_days AS pro_duration_days,
                    
                        t.tht_name AS tht_name,
                    
                        i.inv_number AS inv_number,
                        TO_CHAR(i.inv_date, 'DD/MM/YYYY HH24:MI:SS') AS inv_date,
                        i.inv_subtotal,
                        i.inv_discount,
                        i.inv_tax,
                        i.inv_grand_total
                                
                    FROM ceragen.clinic_session_control s
                    JOIN ceragen.admin_product p ON s.sec_pro_id = p.pro_id
                    JOIN ceragen.admin_invoice i ON s.sec_inv_id = i.inv_id
                    JOIN ceragen.admin_therapy_type t ON p.pro_therapy_type_id = t.tht_id
                    WHERE s.ses_state = TRUE;
            """
            result = DataBaseHandle.getRecords(sql, 0)
            data = convert_decimal_to_float(result)
            HandleLogs.write_log(result)
            if result.get('result'):
                data_from_db = data.get('data') if data.get('data') is not None else []
                return internal_response(True, "Sesiones de control de terapia obtenidas exitosamente.", data_from_db)
            else:
                return internal_response(False,
                                         data.get('message', "Error al obtener sesiones de control de terapia."),
                                         None)

        except Exception as e:
            HandleLogs.write_error(f"Error en getAllTherapySessionsControl: {str(e)}")
            return internal_response(False, "Error interno del servidor al obtener sesiones de control de terapia",
                                     None)

    @staticmethod
    def getTherapySessionControlById(sec_id: int):
        try:
            HandleLogs.write_log(f"Obteniendo sesión de control de terapia con ID {sec_id}.")
            sql = """
                SELECT
                    sec_id,
                    sec_inv_id,
                    sec_pro_id,
                    sec_ses_number,
                    to_char(sec_ses_agend_date, 'DD/MM/YYYY HH24:MI:SS') as sec_ses_agend_date,
                    to_char(sec_ses_exec_date, 'DD/MM/YYYY HH24:MI:SS') as sec_ses_exec_date,
                    sec_typ_id,
                    sec_med_staff_id,
                    ses_consumed,
                    ses_state,
                    user_created,
                    to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created,
                    user_modified,
                    to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') as date_modified,
                    user_deleted,
                    to_char(date_deleted, 'DD/MM/YYYY HH24:MI:SS') as date_deleted
                FROM ceragen.clinic_session_control -- ¡Tabla cambiada!
                WHERE sec_id = %s AND ses_state = TRUE; -- ¡Campo de ID cambiado!
            """
            result = DataBaseHandle.getRecords(sql, 1, (sec_id,))

            if not result.get('result'):
                return internal_response(False, result.get('message', "Error al obtener la sesión de control de terapia."),
                                         None)

            data_from_db = result.get('data')
            if not data_from_db:
                return internal_response(False, f"Sesión de control de terapia con ID {sec_id} no encontrada.", None)

            # Convierte Decimals si es necesario
            clean_data = convert_decimal_to_float(data_from_db)
            return internal_response(True, "Sesión de control de terapia obtenida exitosamente.", clean_data)

        except Exception as e:
            HandleLogs.write_error(f"Error en getTherapySessionControlById: {str(e)}")
            return internal_response(False, "Error interno del servidor al obtener sesión de control de terapia", None)


    @staticmethod
    def createTherapySessionControl(data: dict):  # ¡Nombre cambiado!
        try:
            HandleLogs.write_log(f"Creando nueva sesión de control de terapia. Datos: {data}")
            sql = """
                INSERT INTO ceragen.clinic_session_control (
                        sec_inv_id,
                        sec_pro_id,
                        sec_ses_number,
                        sec_ses_agend_date,
                        sec_ses_exec_date,
                        sec_typ_id,
                        sec_med_staff_id,
                        ses_consumed,
                        ses_state,
                        user_created,
                        date_created
                    )VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)RETURNING sec_id;
            """
            params = (
                data.get('sec_inv_id'),
                data.get('sec_pro_id'),
                data.get('sec_ses_number'),
                data.get('sec_ses_agend_date'),
                data.get('sec_ses_exec_date'),
                data.get('sec_typ_id'),
                data.get('sec_med_staff_id'),
                data.get('ses_consumed'),
                data.get('ses_state'),
                data.get('user_created')
            )
            result = DataBaseHandle.ExecuteInsert(sql, params)

            if result.get("result"):

                return internal_response(True, "Sesión de control de terapia creada exitosamente",
                                         {"sec_id": result["data"][0]["sec_id"]})
            else:
                return internal_response(False, result.get("message", "Error al crear sesión de control de terapia"),
                                         None)
        except Exception as e:
            HandleLogs.write_error(f"Error en createTherapySessionControl: {str(e)}")
            return internal_response(False, "Error interno al crear sesión de control de terapia", None)

    @staticmethod
    def updateTherapySessionControl(sec_id: int, data: dict):
        """
        Actualiza dinámicamente solo los campos enviados de una sesión de control de terapia específica.
        """
        try:
            if not data:
                return internal_response(False, "No se proporcionaron datos para actualizar.", None)

            HandleLogs.write_log(
                f"Actualizando dinámicamente sesión de terapia con ID {sec_id}. Campos recibidos: {list(data.keys())}")

            fields = []
            values = []

            for key, value in data.items():
                # Evitar duplicados en campos de trazabilidad
                if key != "date_modified":
                    fields.append(f"{key} = %s")
                    values.append(value)

            # Solo agregar user_modified si no vino desde el frontend
            if "user_modified" not in data:
                fields.append("user_modified = %s")
                values.append("system")

            fields.append("date_modified = CURRENT_TIMESTAMP")

            sql = f"""
                UPDATE ceragen.clinic_session_control
                SET {', '.join(fields)}
                WHERE sec_id = %s AND ses_state = TRUE
                RETURNING sec_id;
            """
            values.append(sec_id)

            result = DataBaseHandle.ExecuteInsert(sql, tuple(values))

            if result.get("result") and result.get("data"):
                return internal_response(True, "Sesión de control de terapia actualizada exitosamente.",
                                         {"sec_id": result["data"][0]["sec_id"]})
            else:
                return internal_response(False, result.get("message", "No se pudo actualizar la sesión."), None)

        except Exception as e:
            HandleLogs.write_error(f"Error en updateTherapySessionControl: {str(e)}")
            return internal_response(False, "Error interno al actualizar sesión de control de terapia", None)

    @staticmethod
    def deleteTherapySessionControl(sec_id: int, user_deleted: str):
        """
        Inactiva (elimina lógicamente) una sesión de control de terapia específica.
        Requiere el user_deleted para trazabilidad.
        """
        try:
            if not user_deleted:
                return internal_response(False, "El usuario que elimina es requerido para la eliminación.", None)

            HandleLogs.write_log(
                f"Inactivando sesión de control de terapia ID {sec_id} por el usuario {user_deleted}."
            )

            sql = """
                UPDATE ceragen.clinic_session_control
                SET
                    ses_state = FALSE, 
                    user_deleted = %s,
                    date_deleted = CURRENT_TIMESTAMP
                WHERE sec_id = %s AND ses_state = TRUE;
            """
            params = (user_deleted, sec_id)

            result_db = DataBaseHandle.ExecuteNonQuery(sql, params)
            HandleLogs.write_log(f"Resultado del componente deleteTherapySessionControl para ID {sec_id}: {result_db}")

            if not result_db.get('result'):
                return internal_response(
                    False,
                    result_db.get('message', "Error al inactivar sesión de control de terapia."),
                    None
                )

            rows_affected = result_db.get('data')
            if rows_affected is None:
                return internal_response(False, "No se recibió confirmación del servidor al eliminar.", None)

            if rows_affected > 0:
                return response_success({"message": "Sesión de control de terapia inactivada exitosamente."})
            else:
                return internal_response(
                    False,
                    f"Sesión con ID {sec_id} no encontrada o ya estaba inactiva.",
                    None
                )

        except Exception as e:
            HandleLogs.write_error(f"Error en deleteTherapySessionControl: {str(e)}")
            return internal_response(False, "Error interno al inactivar sesión de control de terapia.", None)
