from ....utils.common.convert_float import convert_decimal_to_float
from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from datetime import datetime
from ....utils.general.response import internal_response

class AdminInvoiceTaxComponent:
    @staticmethod
    def ListAll():
        try:
            query = """
                SELECT 
                    int_id,
                    int_invoice_id,
                    int_tax_id,
                    int_tax_amount,
                    int_state,
                    user_created,
                    TO_CHAR(date_created, 'DD/MM/YYYY HH24:MI:SS') AS date_created,
                    user_modified,
                    TO_CHAR(date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified,
                    user_deleted,
                    TO_CHAR(date_deleted, 'DD/MM/YYYY HH24:MI:SS') AS date_deleted
                FROM ceragen.admin_invoice_tax
                WHERE int_state = true
            """
            res = DataBaseHandle.getRecords(query, 0)
            data = convert_decimal_to_float(res)
            return data
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def GetById(int_id):
        try:
            query = """
                SELECT 
                    int_id,
                    int_invoice_id,
                    int_tax_id,
                    int_tax_amount,
                    int_state,
                    user_created,
                    TO_CHAR(date_created, 'DD/MM/YYYY HH24:MI:SS') AS date_created,
                    user_modified,
                    TO_CHAR(date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified,
                    user_deleted,
                    TO_CHAR(date_deleted, 'DD/MM/YYYY HH24:MI:SS') AS date_deleted
                FROM ceragen.admin_invoice_tax
                WHERE int_state = true AND int_id = %s
            """
            data = DataBaseHandle.getRecords(query, 1, (int_id,))
            res = convert_decimal_to_float(data)
            return res
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def GetByInvoiceId(int_invoice_id):
        try:
            query = """
                SELECT 
                    it.int_id,
                    it.int_invoice_id,
                    i.inv_number,
                    TO_CHAR(i.inv_date, 'DD/MM/YYYY') AS inv_date,
                    it.int_tax_id,
                    t.tax_name,
                    t.tax_percentage,
                    it.int_tax_amount,
                    it.int_state,
                    it.user_created,
                    TO_CHAR(it.date_created, 'DD/MM/YYYY HH24:MI:SS') AS date_created,
                    it.user_modified,
                    TO_CHAR(it.date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified,
                    it.user_deleted,
                    TO_CHAR(it.date_deleted, 'DD/MM/YYYY HH24:MI:SS') AS date_deleted
                FROM ceragen.admin_invoice_tax it
                JOIN ceragen.admin_invoice i ON it.int_invoice_id = i.inv_id
                JOIN ceragen.admin_tax t ON it.int_tax_id = t.tax_id
                WHERE it.int_state = true 
                  AND i.inv_state = true
                  AND t.tax_state = true
                  AND it.int_invoice_id = %s
            """
            data = DataBaseHandle.getRecords(query, 0, (int_invoice_id,))
            res = convert_decimal_to_float(data)
            return res
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def Add(data):
        v_result = False
        v_message = None
        v_data = None
        try:
            sql = """
                INSERT INTO ceragen.admin_invoice_tax (
                    int_invoice_id,
                    int_tax_id,
                    int_tax_amount,
                    int_state,
                    user_created,
                    date_created
                ) VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING int_id
            """
            record = (
                data["int_invoice_id"],
                data["int_tax_id"],
                data["int_tax_amount"],
                True,
                data["user_process"],
                datetime.now(),
            )
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al insertar impuesto en factura: {err}"
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def Update(data):
        v_result = False
        v_message = None
        v_data = None
        try:
            sql = """
                UPDATE ceragen.admin_invoice_tax
                SET
                    int_invoice_id = %s,
                    int_tax_id = %s,
                    int_tax_amount = %s,
                    user_modified = %s,
                    date_modified = %s
                WHERE int_id = %s
            """
            record = (
                data["int_invoice_id"],
                data["int_tax_id"],
                data["int_tax_amount"],
                data["user_process"],
                datetime.now(),
                data["int_id"],
            )
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al actualizar impuesto en factura: {err}"
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def Delete(int_id, user):
        v_result = False
        v_message = None
        try:
            sql = """
                UPDATE ceragen.admin_invoice_tax
                SET int_state = false, user_deleted = %s, date_deleted = %s
                WHERE int_id = %s
            """
            record = (user, datetime.now(), int_id)
            rows_affected = DataBaseHandle.ExecuteNonQuery(sql, record)
            HandleLogs.write_log("Filas afectadas: " + str(rows_affected))
            if rows_affected["data"] > 0:
                v_result = True
                v_message = f"Impuesto en factura con ID {int_id} eliminado exitosamente."
            else:
                v_message = f"No se encontró impuesto en factura con ID {int_id}."
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al eliminar impuesto en factura: {err}"
        finally:
            return internal_response(v_result, v_message, None)
