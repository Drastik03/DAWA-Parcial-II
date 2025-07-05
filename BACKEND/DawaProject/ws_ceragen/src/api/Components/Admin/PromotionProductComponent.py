from flask import jsonify
from ....utils.database.connection_db import DataBaseHandle
from datetime import datetime
from ....utils.general.logs import HandleLogs
from ....utils.general.response import internal_response

class AdminPromotionComponent:

    @staticmethod
    def list_all_promotion():
        try:
            query = """
                SELECT 
                    p.ppr_id,
                    p.ppr_product_id,
                    p.ppr_name,
                    p.ppr_description,
                    CAST(p.ppr_discount_percent AS FLOAT) AS discount_percent,
                    p.ppr_extra_sessions,
                    TO_CHAR(p.ppr_start_date, 'DD/MM/YY') AS start_date,
                    TO_CHAR(p.ppr_end_date, 'DD/MM/YY') AS end_date,
                    p.ppr_state,
                    p.user_created,
                    TO_CHAR(p.date_created, 'YYYY-MM-DD HH24:MI:SS') AS date_created,
                    p.user_modified,
                    TO_CHAR(p.date_modified, 'YYYY-MM-DD HH24:MI:SS') AS date_modified,
                    p.user_deleted,
                    TO_CHAR(p.date_deleted, 'YYYY-MM-DD HH24:MI:SS') AS date_deleted,
                    pr.pro_name
                FROM 
                    ceragen.admin_product_promotion AS p
                INNER JOIN 
                    ceragen.admin_product AS pr
                    ON p.ppr_product_id = pr.pro_id
                WHERE 
                    p.ppr_state = TRUE;
            """
            result = DataBaseHandle.getRecords(query, 0)
            return result
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def get_promotion_by_id(ppr_id):
        try:
            query = """
                SELECT 
                    ppr_id, ppr_product_id, ppr_name, ppr_description,
                    CAST(ppr_discount_percent AS FLOAT) AS discount_percent,
                    ppr_extra_sessions, 
                    TO_CHAR(ppr_start_date, 'YYYY-MM-DD') AS start_date,
                    TO_CHAR(ppr_end_date, 'YYYY-MM-DD') AS end_date,
                    ppr_state, user_created, TO_CHAR(date_created, 'YYYY-MM-DD HH24:MI:SS') AS date_created,
                    user_modified, TO_CHAR(date_modified, 'YYYY-MM-DD HH24:MI:SS') AS date_modified,
                    user_deleted, TO_CHAR(date_deleted, 'YYYY-MM-DD HH24:MI:SS') AS date_deleted
                FROM ceragen.admin_product_promotion
                WHERE ppr_id = %s
            """
            record = (ppr_id,)
            result = DataBaseHandle.getRecords(query, 1, record)
            return result
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def add_promotion(data_to_insert):
        try:
            v_message = None
            v_result = False
            v_data = None
            sql = """
                INSERT INTO ceragen.admin_product_promotion(
                    ppr_product_id,
                    ppr_name,
                    ppr_description,
                    ppr_discount_percent,
                    ppr_extra_sessions,
                    ppr_start_date,
                    ppr_end_date,
                    ppr_state,
                    user_created,
                    date_created
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            record = (
                data_to_insert["ppr_product_id"],
                data_to_insert["ppr_name"],
                data_to_insert["ppr_description"],
                data_to_insert["ppr_discount_percent"],
                data_to_insert["ppr_extra_sessions"],
                data_to_insert["ppr_start_date"],
                data_to_insert["ppr_end_date"],
                True,
                data_to_insert["user_created"],
                datetime.now(),
            )
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = "Error al registrar promoción: " + str(err)
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def update_promotion(data_to_update):
        try:
            v_message = None
            v_result = False
            v_data = None
            sql = """
                UPDATE ceragen.admin_product_promotion
                SET 
                    ppr_product_id=%s,
                    ppr_name=%s,
                    ppr_description=%s,
                    ppr_discount_percent=%s,
                    ppr_extra_sessions=%s,
                    ppr_start_date=%s,
                    ppr_end_date=%s,
                    user_modified=%s,
                    date_modified=%s
                WHERE ppr_id=%s
            """
            record = (
                data_to_update["ppr_product_id"],
                data_to_update["ppr_name"],
                data_to_update["ppr_description"],
                data_to_update["ppr_discount_percent"],
                data_to_update["ppr_extra_sessions"],
                data_to_update["ppr_start_date"],
                data_to_update["ppr_end_date"],
                data_to_update["user_process"],
                datetime.now(),
                data_to_update["ppr_id"],
            )
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = "Error al actualizar promoción: " + str(err)
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def delete_promotion(ppr_id, p_user):
        try:
            query = """
                UPDATE ceragen.admin_product_promotion
                SET ppr_state = FALSE,
                    user_deleted = %s,
                    date_deleted = %s
                WHERE ppr_id = %s
            """
            record = (p_user, datetime.now(), ppr_id)
            result = DataBaseHandle.ExecuteNonQuery(query, record)
            if result.get("rows_affected", 0) > 0:
                return internal_response(True, f"Promoción con ID {ppr_id} eliminada exitosamente.", 1)
            else:
                return internal_response(False, f"No se encontró ninguna promoción con ID {ppr_id}.", 0)

        except Exception as err:
            HandleLogs.write_error(err)
            return internal_response(False, str(err), None)
