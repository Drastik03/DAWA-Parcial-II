from ....utils.common.convert_float import convert_decimal_to_float
from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from datetime import datetime
from ....utils.general.response import internal_response

class InvoicePaymentComponent:
    @staticmethod
    def ListAllPayments():
        try:
            query = """
                SELECT 
                    inp_id,
                    inp_invoice_id,
                    inp_payment_method_id,
                    inp_amount,
                    inp_reference,
                    inp_proof_image_path,
                    inp_state,
                    user_created,
                    TO_CHAR(date_created, 'DD/MM/YYYY HH24:MI:SS') AS date_created,
                    user_modified,
                    TO_CHAR(date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified,
                    user_deleted,
                    TO_CHAR(date_deleted, 'DD/MM/YYYY HH24:MI:SS') AS date_deleted
                FROM ceragen.admin_invoice_payment
                WHERE inp_state = true
            """
            return DataBaseHandle.getRecords(query, 0)
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def GetPaymentById(inp_id):
        try:
            query = """
                SELECT 
                    inp_id,
                    inp_invoice_id,
                    inp_payment_method_id,
                    inp_amount,
                    inp_reference,
                    inp_proof_image_path,
                    inp_state,
                    user_created,
                    TO_CHAR(date_created, 'DD/MM/YYYY HH24:MI:SS') AS date_created,
                    user_modified,
                    TO_CHAR(date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified,
                    user_deleted,
                    TO_CHAR(date_deleted, 'DD/MM/YYYY HH24:MI:SS') AS date_deleted
                FROM ceragen.admin_invoice_payment
                WHERE inp_state = true AND inp_id = %s
            """
            res = DataBaseHandle.getRecords(query, 1, (inp_id,))
            if res and res["data"]:
                data = convert_decimal_to_float(res["data"])
                return internal_response(True,"Se encontro la factura del pago", data)
            return internal_response(False,"No se encontro", None)
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def AddPayment(data):
        v_result = False
        v_message = None
        v_data = None
        try:
            data["inp_reference"] = InvoicePaymentComponent.GenerateNextInvoicePaymentNumber()
            sql = """
                INSERT INTO ceragen.admin_invoice_payment (
                    inp_invoice_id,
                    inp_payment_method_id,
                    inp_amount,
                    inp_reference,
                    inp_proof_image_path,
                    inp_state,
                    user_created,
                    date_created
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING inp_id
            """
            record = (
                data["inp_invoice_id"],
                data["inp_payment_method_id"],
                data["inp_amount"],
                data["inp_reference"],
                data.get("inp_proof_image_path", None),
                True,
                data["user_process"],
                datetime.now()
            )
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al insertar el pago de factura: {err}"
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def UpdatePayment(data):
        v_result = False
        v_message = None
        v_data = None
        try:
            inp_reference = data.get("inp_reference")
            if not inp_reference:
                inp_reference = InvoicePaymentComponent.GenerateNextInvoicePaymentNumber()

            sql = """
                UPDATE ceragen.admin_invoice_payment
                SET
                    inp_invoice_id = %s,
                    inp_payment_method_id = %s,
                    inp_amount = %s,
                    inp_reference = %s,
                    inp_proof_image_path = %s,
                    user_modified = %s,
                    date_modified = %s
                WHERE inp_id = %s
            """

            record = (
                data["inp_invoice_id"],
                data["inp_payment_method_id"],
                data["inp_amount"],
                inp_reference,
                data.get("inp_proof_image_path", None),
                data["user_process"],
                datetime.now(),
                data["inp_id"]
            )

            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al actualizar el pago de factura: {err}"
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def DeletePayment(inp_id, user):
        v_result = False
        v_message = None
        try:
            sql = """
                UPDATE ceragen.admin_invoice_payment
                SET inp_state = false, user_deleted = %s, date_deleted = %s
                WHERE inp_id = %s
            """
            record = (user, datetime.now(), inp_id)
            rows_affected = DataBaseHandle.ExecuteNonQuery(sql, record)
            HandleLogs.write_log(f"Filas afectadas: {rows_affected}")
            if rows_affected["data"] > 0:
                v_result = True
                v_message = f"Pago con ID {inp_id} eliminado exitosamente."
            else:
                v_message = f"No se encontró ningún pago con ID {inp_id}."
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al eliminar el pago de factura: {err}"
        finally:
            return internal_response(v_result, v_message, None)


    @staticmethod
    def GenerateNextInvoicePaymentNumber():
        try:
            sql = """
                   SELECT LPAD(
                       CAST(
                           COALESCE(
                               MAX(CAST(SUBSTRING(inp_reference, 3) AS INTEGER)),
                               0
                           ) + 1 AS TEXT
                       ),
                       6,
                       '0'
                   ) AS next_number
                   FROM ceragen.admin_invoice_payment
                   WHERE inp_reference LIKE 'P-%'
               """
            result = DataBaseHandle.getRecords(sql, 1)
            if result and result.get("data"):
                return f"P-{result['data']['next_number']}"
            return "P-000001"
        except Exception as err:
            HandleLogs.write_error(err)
            return "P-000001"
