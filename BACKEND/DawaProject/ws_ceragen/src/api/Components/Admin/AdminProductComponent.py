from ....utils.common.convert_float import convert_decimal_to_float
from ....utils.database.connection_db import DataBaseHandle
from datetime import datetime
from ....utils.general.logs import HandleLogs
from ....utils.general.response import internal_response

class AdminProductComponent:
    @staticmethod
    def list_all_products():
        try:
            query = """
                        SELECT 
                            p.pro_id,
                            p.pro_code,
                            p.pro_name,
                            p.pro_description,
                            p.pro_price,
                            p.pro_total_sessions,
                            p.pro_duration_days,
                            p.pro_image_url,
                            p.pro_therapy_type_id,
                            t.tht_name,
                            p.pro_state,
                            p.user_created,
                            promo.ppr_name,
                            promo.ppr_description,
                            promo.ppr_discount_percent,
                            promo.ppr_extra_sessions,
                            TO_CHAR(promo.ppr_start_date, 'DD/MM/YYYY') AS ppr_start_date,
                            TO_CHAR(promo.ppr_end_date, 'DD/MM/YYYY') AS ppr_end_date,
                            TO_CHAR(p.date_created, 'DD/MM/YYYY HH24:MI:SS') AS date_created,
                            p.user_modified,
                            TO_CHAR(p.date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified,
                            p.user_deleted,
                            TO_CHAR(p.date_deleted, 'DD/MM/YYYY HH24:MI:SS') AS date_deleted
                        FROM ceragen.admin_product p
                        LEFT JOIN ceragen.admin_therapy_type t ON p.pro_therapy_type_id = t.tht_id
                        LEFT JOIN ceragen.admin_product_promotion promo ON p.pro_id = promo.ppr_product_id
                        WHERE p.pro_state = true;
                    """
            data = DataBaseHandle.getRecords(query, 0)
            data = convert_decimal_to_float(data)
            return data
        except Exception as err:
            HandleLogs.write_error(err)
            return internal_response(False, str(err), [])

    @staticmethod
    def get_product_by_id(pro_id):
        try:
            query = """
                SELECT pro_id, pro_code, pro_name, pro_description, pro_price, pro_total_sessions,
                       pro_duration_days, pro_image_url, pro_therapy_type_id, pro_state,
                       user_created, to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created,
                       user_modified, to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') as date_modified,
                       user_deleted, to_char(date_deleted, 'DD/MM/YYYY HH24:MI:SS') as date_deleted
                FROM ceragen.admin_product
                WHERE pro_id = %s
            """
            data = DataBaseHandle.getRecords(query, 1, (pro_id,))
            return internal_response(True, "Consulta exitosa", data) if data else internal_response(False, f"No se encontró producto con ID {pro_id}", None)
        except Exception as err:
            HandleLogs.write_error(err)
            return internal_response(False, str(err), None)

    @staticmethod
    def add_product(data):
        try:
            sql = """
                INSERT INTO ceragen.admin_product (
                    pro_code, pro_name, pro_description, pro_price, pro_total_sessions,
                    pro_duration_days, pro_image_url, pro_therapy_type_id,
                    pro_state, user_created, date_created
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            record = (
                data['pro_code'],
                data['pro_name'],
                data.get('pro_description'),
                data['pro_price'],
                data['pro_total_sessions'],
                data.get('pro_duration_days'),
                data.get('pro_image_url'),
                data['pro_therapy_type_id'],
                True,
                data['user_created'],
                datetime.now()
            )
            inserted_id = DataBaseHandle.ExecuteNonQuery(sql, record)
            return internal_response(True, "Producto agregado correctamente", inserted_id)
        except Exception as err:
            HandleLogs.write_error(err)
            return internal_response(False, "Error al insertar producto: " + str(err), None)

    @staticmethod
    def update_product(data):
        try:
            sql = """
                UPDATE ceragen.admin_product
                SET pro_code = %s, pro_name = %s, pro_description = %s, pro_price = %s,
                    pro_total_sessions = %s, pro_duration_days = %s, pro_image_url = %s,
                    pro_therapy_type_id = %s, user_modified = %s, date_modified = %s
                WHERE pro_id = %s
            """
            record = (
                data['pro_code'],
                data['pro_name'],
                data.get('pro_description'),
                data['pro_price'],
                data['pro_total_sessions'],
                data.get('pro_duration_days'),
                data.get('pro_image_url'),
                data['pro_therapy_type_id'],
                data['user_process'],
                datetime.now(),
                data['pro_id']
            )
            affected = DataBaseHandle.ExecuteNonQuery(sql, record)
            if affected:
                return internal_response(True, "Producto actualizado correctamente", affected)
            return internal_response(False, "No se encontró el producto para actualizar", 0)
        except Exception as err:
            HandleLogs.write_error(err)
            return internal_response(False, "Error al actualizar producto: " + str(err), None)

    @staticmethod
    def delete_product(pro_id, user):
        try:
            sql = """
                UPDATE ceragen.admin_product
                SET pro_state = false, user_deleted = %s, date_deleted = %s
                WHERE pro_id = %s
            """
            record = (user, datetime.now(), pro_id)
            res = DataBaseHandle.ExecuteNonQuery(sql, record)

            affected = res.get("data", 0) if isinstance(res, dict) else 0

            if affected > 0:
                return internal_response(True, f"Producto con ID {pro_id} eliminado correctamente.", affected)
            else:
                return internal_response(False, f"No se encontró el producto con ID {pro_id}.", 0)
        except Exception as err:
            HandleLogs.write_error(err)
            return internal_response(False, str(err), None)
