from flask import jsonify
from ....utils.database.connection_db import DataBaseHandle
from datetime import datetime
from ....utils.general.logs import HandleLogs
from ....utils.general.response import internal_response

class AdminPaymentMethodComponent:
    @staticmethod
    def payment_methods_all():
        try:
            query = """
                SELECT 
                    pme_id,
                    pme_name,
                    pme_description,
                    pme_require_references,
                    pme_require_picture_proff,
                    pme_state,
                    user_created,
                    TO_CHAR(date_created, 'DD/MM/YYYY HH24:MI:SS') AS date_created,
                    user_modified,
                    TO_CHAR(date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified,
                    user_deleted,
                    TO_CHAR(date_deleted, 'DD/MM/YYYY HH24:MI:SS') AS date_deleted
                FROM ceragen.admin_payment_method
                WHERE pme_state = TRUE
                ORDER BY pme_id;
            """
            data = DataBaseHandle.getRecords(query, 0)
            return internal_response(True, "Métodos de pago obtenidos correctamente.", data)
        except Exception as err:
            HandleLogs.write_error(err)
            return internal_response(False, f"Error al obtener métodos de pago: {err}", [])

    @staticmethod
    def add_payment_method(data_to_insert):
        try:
            v_message = None
            v_result = False
            v_data = None
            sql = """
                INSERT INTO ceragen.admin_payment_method (
                    pme_name,
                    pme_description,
                    pme_require_references,
                    pme_require_picture_proff,
                    pme_state,
                    user_created,
                    date_created
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            record = (
                data_to_insert["pme_name"],
                data_to_insert["pme_description"],
                data_to_insert["pme_require_references"],
                data_to_insert["pme_require_picture_proff"],
                True,
                data_to_insert["user_created"],
                datetime.now()
            )
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = "Error al registrar método de pago: " + str(err)
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def get_payment_by_id(pme_id):
        try:
            query = """
                SELECT 
                    pme_id,
                    pme_name,
                    pme_description,
                    pme_require_references,
                    pme_require_picture_proff,
                    pme_state,
                    user_created,
                    TO_CHAR(date_created,'DD/MM/YY'),
                    user_modified,                   
                    TO_CHAR(date_modified,'DD/MM/YY'),
                    user_deleted,
                    TO_CHAR(date_deleted,'DD/MM/YY')   
                FROM ceragen.admin_payment_method
                WHERE ppr_id = %s
            """
            record = (pme_id,)
            result = DataBaseHandle.getRecords(query, 1, record)
            return result
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def update_payment_method(data_to_update):
        try:
            v_message = None
            v_result = False
            v_data = None
            sql = """
                UPDATE ceragen.admin_payment_method
                SET 
                    pme_name = %s,
                    pme_description = %s,
                    pme_require_references = %s,
                    pme_require_picture_proff = %s,
                    user_modified = %s,
                    date_modified = %s
                WHERE pme_id = %s
            """
            record = (
                data_to_update["pme_name"],
                data_to_update["pme_description"],
                data_to_update["pme_require_references"],
                data_to_update["pme_require_picture_proff"],
                data_to_update["user_modified"],
                datetime.now(),
                data_to_update["pme_id"]
            )
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = "Error al actualizar método de pago: " + str(err)
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def delete_payment_method(pme_id, p_user):
        res = False
        data = None
        message = None
        try:
            query = """
                UPDATE ceragen.admin_payment_method
                SET pme_state = FALSE,
                    user_deleted = %s,
                    date_deleted = %s
                WHERE pme_id = %s
            """
            record = (p_user, datetime.now(), pme_id)
            data = DataBaseHandle.ExecuteNonQuery(query, record)
            HandleLogs.write_log("ROWS EN PAYMENT", data)
            if data["data"] == 0:
                message = f"No se encontró método de pago con ID {pme_id}."
                return internal_response(False, message, 0)
            else:
                res = True
                return internal_response(True, f"Método de pago ID {pme_id} eliminado exitosamente.", 1)
        except Exception as err:
            HandleLogs.write_error(err)
            return internal_response(res, str(err), data)

