from ....utils.common.convert_float import convert_decimal_to_float
from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from datetime import datetime
from ....utils.general.response import internal_response

class AdminInvoiceDetailComponent:

    @staticmethod
    def ListAllDetails():
        try:
            sql = """
                SELECT 
                    ind_id,
                    ind_invoice_id,
                    ind_product_id,
                    ind_quantity,
                    ind_unit_price,
                    ind_total,
                    ind_state,
                    user_created,
                    TO_CHAR(date_created, 'DD/MM/YYYY HH24:MI:SS') AS date_created,
                    user_modified,
                    TO_CHAR(date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified,
                    user_deleted,
                    TO_CHAR(date_deleted, 'DD/MM/YYYY HH24:MI:SS') AS date_deleted
                FROM ceragen.admin_invoice_detail
                WHERE ind_state = true
            """
            return DataBaseHandle.getRecords(sql, 0)
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def GetDetailById(ind_id):
        try:
            sql = """
                SELECT *
                FROM ceragen.admin_invoice_detail
                WHERE ind_id = %s AND ind_state = true
            """
            return DataBaseHandle.getRecords(sql, 1, (ind_id,))
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def GetDetailsByInvoiceId(invoice_id):
        try:
            sql = """
                SELECT *
                FROM ceragen.admin_invoice_detail
                WHERE ind_invoice_id = %s AND ind_state = true
            """
            return DataBaseHandle.getRecords(sql, 0, (invoice_id,))
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def AddInvoiceDetail(data):
        v_result = False
        v_message = None
        v_data = None
        try:
            sql = """
                INSERT INTO ceragen.admin_invoice_detail (
                    ind_invoice_id,
                    ind_product_id,
                    ind_quantity,
                    ind_unit_price,
                    ind_total,
                    ind_state,
                    user_created,
                    date_created
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING ind_id
            """
            record = (
                data["ind_invoice_id"],
                data["ind_product_id"],
                data["ind_quantity"],
                data["ind_unit_price"],
                data["ind_total"],
                True,
                data["user_process"],
                datetime.now()
            )
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al registrar detalle de factura: {err}"
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def UpdateInvoiceDetail(data):
        v_result = False
        v_message = None
        v_data = None
        try:
            sql = """
                UPDATE ceragen.admin_invoice_detail
                SET 
                    ind_product_id = %s,
                    ind_quantity = %s,
                    ind_unit_price = %s,
                    ind_total = %s,
                    user_modified = %s,
                    date_modified = %s
                WHERE ind_id = %s
            """
            record = (
                data["ind_product_id"],
                data["ind_quantity"],
                data["ind_unit_price"],
                data["ind_total"],
                data["user_process"],
                datetime.now(),
                data["ind_id"]
            )
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            res = convert_decimal_to_float()
            if res is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al actualizar detalle: {err}"
        finally:
            return internal_response(v_result, v_message, res)

    @staticmethod
    def DeleteInvoiceDetail(ind_id, user):
        v_result = False
        v_message = None
        try:
            sql = """
                UPDATE ceragen.admin_invoice_detail
                SET ind_state = false,
                    user_deleted = %s,
                    date_deleted = %s
                WHERE ind_id = %s
            """
            record = (user, datetime.now(), ind_id)
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data["data"] > 0:
                v_result = True
                v_message = f"Detalle con ID {ind_id} eliminado correctamente."
            else:
                v_message = f"No se encontró detalle con ID {ind_id}."
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al eliminar detalle: {err}"
        finally:
            return internal_response(v_result, v_message, None)

    @staticmethod
    def GetByInvoiceId(int_invoice_id):
        try:
            query = """
                SELECT 
                    d.ind_id,
                    d.ind_invoice_id,
                    d.ind_product_id,
                    p.pro_code,
                    p.pro_name,
                    p.pro_price,
                    d.ind_quantity,
                    d.ind_unit_price,
                    d.ind_total,
                    d.ind_state,
                    d.user_created,
                    TO_CHAR(d.date_created, 'DD/MM/YYYY HH24:MI:SS') AS date_created,
                    d.user_modified,
                    TO_CHAR(d.date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified,
                    d.user_deleted,
                    TO_CHAR(d.date_deleted, 'DD/MM/YYYY HH24:MI:SS') AS date_deleted
                FROM ceragen.admin_invoice_detail d
                JOIN ceragen.admin_product p ON d.ind_product_id = p.pro_id
                WHERE d.ind_state = true AND p.pro_state = true AND d.ind_invoice_id = %s
            """
            data = DataBaseHandle.getRecords(query, 0, (int_invoice_id,))
            res = convert_decimal_to_float(data)
            return res
        except Exception as err:
            HandleLogs.write_error(err)
            return None
