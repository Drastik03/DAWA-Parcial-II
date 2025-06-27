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
                SELECT pro_id, pro_code, pro_name, pro_description, pro_price, pro_total_sessions,
                       pro_duration_days, pro_image_url, pro_therapy_type_id, pro_state,
                       user_created, to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created,
                       user_modified, to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') as date_modified,
                       user_deleted, to_char(date_deleted, 'DD/MM/YYYY HH24:MI:SS') as date_deleted
                FROM ceragen.admin_product
                WHERE pro_state = true
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
            affected = DataBaseHandle.ExecuteNonQuery(sql, record)
            if affected > 0:
                return internal_response(True, f"Producto con ID {pro_id} eliminado correctamente.", affected)
            else:
                return internal_response(False, f"No se encontró el producto con ID {pro_id}.", 0)
        except Exception as err:
            HandleLogs.write_error(err)
            return internal_response(False, str(err), None)
