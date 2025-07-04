from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from datetime import datetime
from ....utils.general.response import internal_response

class AdminInvoiceComponent:
    @staticmethod
    def ListAllInvoice():
        try:
            query = """
                SELECT 
                    i.inv_id,
                    i.inv_number,
                    TO_CHAR(i.inv_date, 'DD/MM/YYYY HH24:MI:SS') AS date_invoice,
                    p.per_identification,
                    CONCAT(p.per_names, ' ', p.per_surnames) AS full_name,
                    i.inv_subtotal,
                    i.inv_discount,
                    i.inv_tax,
                    i.inv_grand_total,
                    i.inv_state,
                    i.user_created,
                    TO_CHAR(i.date_created, 'DD/MM/YYYY HH24:MI:SS') AS date_created,
                    i.user_modified,
                    TO_CHAR(i.date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified,
                    i.user_deleted,
                    TO_CHAR(i.date_deleted, 'DD/MM/YYYY HH24:MI:SS') AS date_deleted
                FROM ceragen.admin_invoice AS i
                INNER JOIN ceragen.admin_person AS p ON i.inv_client_id = p.per_id
                INNER JOIN ceragen.admin_patient AS pat ON i.inv_patient_id = pat.pat_id
                WHERE i.inv_state = true
            """
            return DataBaseHandle.getRecords(query, 0)
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def GetInvoiceId(inv_id):
        try:
            query = """
                    SELECT 
                    i.inv_id,
                    i.inv_number,
                    TO_CHAR(i.inv_date, 'DD/MM/YYYY HH24:MI:SS') AS date_invoice,
                    p.per_identification,
                    CONCAT(p.per_names, ' ', p.per_surnames) AS full_name,
                    i.inv_subtotal,
                    i.inv_discount,
                    i.inv_tax,
                    i.inv_grand_total,
                    i.inv_state,
                    i.user_created,
                    TO_CHAR(i.date_created, 'DD/MM/YYYY HH24:MI:SS') AS date_created,
                    i.user_modified,
                    TO_CHAR(i.date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified,
                    i.user_deleted,
                    TO_CHAR(i.date_deleted, 'DD/MM/YYYY HH24:MI:SS') AS date_deleted
                FROM ceragen.admin_invoice AS i
                INNER JOIN ceragen.admin_person AS p ON i.inv_client_id = p.per_id
                INNER JOIN ceragen.admin_patient AS pat ON i.inv_patient_id = pat.pat_id
                WHERE i.inv_state = true AND i.inv_id = %s;
                """
            return DataBaseHandle.getRecords(query, 1, (inv_id,))
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def AddInvoice(data):
        v_result = False
        v_message = None
        v_data = None
        try:
            inv_number = AdminInvoiceComponent.GenerateNextInvoiceNumber()

            sql = """
                INSERT INTO ceragen.admin_invoice (
                    inv_number, inv_date, inv_client_id, inv_patient_id,
                    inv_subtotal, inv_discount, inv_tax,
                    inv_state, user_created, date_created
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING inv_id
            """
            record = (
                inv_number,
                data["inv_date"],
                data["inv_client_id"],
                data["inv_patient_id"],
                data["inv_subtotal"],
                data["inv_discount"],
                data["inv_tax"],
                True,
                data["user_process"],
                datetime.now()
            )
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al insertar la factura: {err}"
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def UpdateInvoice(data):
        v_result = False
        v_message = None
        v_data = None
        try:
            sql = """
                    UPDATE ceragen.admin_expense 
                    SET exp_type_id = %s, exp_payment_method_id = %s, exp_date = %s, exp_amount = %s,
                        exp_description = %s, exp_receipt_number = %s,
                        user_modified = %s, date_modified = %s
                    WHERE exp_id = %s
                """
            record = (
                data["exp_type_id"],
                data["exp_payment_method_id"],
                data["exp_date"],
                data["exp_amount"],
                data.get("exp_description", None),
                data.get("exp_receipt_number", None),
                data["user_process"],
                datetime.now(),
                data["exp_id"]
            )
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al actualizar el gasto: {err}"
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def DeleteInvoice(exp_id, user):
        v_result = False
        v_message = None
        try:
            sql = """
                    UPDATE ceragen.admin_invoice
                    SET inv_state = false, user_deleted = %s, date_deleted = %s
                    WHERE inv_id = %s
                """
            record = (user, datetime.now(), exp_id)
            rows_affected = DataBaseHandle.ExecuteNonQuery(sql, record)
            HandleLogs.write_log("Filas afectadas: " + str(rows_affected))
            if rows_affected["data"] > 0:
                v_result = True
                v_message = f"Gasto con ID {exp_id} eliminado exitosamente."
            else:
                v_message = f"No se encontró ningún gasto con ID {exp_id}."
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al eliminar el gasto: {err}"
        finally:
            return internal_response(v_result, v_message, None)

    @staticmethod
    def GenerateNextInvoiceNumber():
        try:
            sql = """
                SELECT LPAD(
                    CAST(
                        COALESCE(
                            MAX(CAST(SUBSTRING(inv_number, 3) AS INTEGER)),
                            0
                        ) + 1 AS TEXT
                    ),
                    6,
                    '0'
                ) AS next_number
                FROM ceragen.admin_invoice
                WHERE inv_number LIKE 'F-%'
            """
            result = DataBaseHandle.getRecords(sql, 1)
            if result and result.get("data"):
                return f"F-{result['data']['next_number']}"
            return "F-000001"
        except Exception as err:
            HandleLogs.write_error(err)
            return "F-000001"
