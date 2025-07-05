from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from datetime import datetime
from ....utils.general.response import internal_response

class AdminExpenseComponent:
    @staticmethod
    def ListAllExpense():
        try:
            query = """
                SELECT 
                        e.exp_id,
                        ext.ext_name,
                        pme.pme_name,
                        to_char(e.exp_date, 'DD/MM/YYYY HH24:MI:SS') AS date_expense,
                        CAST(e.exp_amount AS double precision),
                        e.exp_description,
                        e.exp_receipt_number,
                        e.user_created,
                        to_char(e.date_created, 'DD/MM/YYYY HH24:MI:SS') AS date_created,
                        e.user_modified,
                        to_char(e.date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified,
                        e.user_deleted,
                        to_char(e.date_deleted, 'DD/MM/YYYY HH24:MI:SS') AS date_deleted
                    FROM ceragen.admin_expense AS e
                    INNER JOIN ceragen.admin_payment_method AS pme ON e.exp_payment_method_id = pme.pme_id
                    INNER JOIN ceragen.admin_expense_type AS ext ON e.exp_type_id = ext.ext_id
                    WHERE e.exp_state = true;
            """
            return DataBaseHandle.getRecords(query, 0)
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def ExpenseByDateRange(from_date, to_date):
        try:
            query = """
                    SELECT 
                            e.exp_id,
                            ext.ext_name,
                            pme.pme_name,
                            to_char(e.exp_date, 'DD/MM/YYYY HH24:MI:SS') AS date_expense,
                            CAST(e.exp_amount AS double precision),
                            e.exp_description,
                            e.exp_receipt_number,
                            e.user_created,
                            to_char(e.date_created, 'DD/MM/YYYY HH24:MI:SS') AS date_created,
                            e.user_modified,
                            to_char(e.date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified,
                            e.user_deleted,
                            to_char(e.date_deleted, 'DD/MM/YYYY HH24:MI:SS') AS date_deleted
                        FROM ceragen.admin_expense AS e
                        INNER JOIN ceragen.admin_payment_method AS pme ON e.exp_payment_method_id = pme.pme_id
                        INNER JOIN ceragen.admin_expense_type AS ext ON e.exp_type_id = ext.ext_id
                        WHERE e.exp_state = true
                          AND e.exp_date BETWEEN %s AND %s
                        ORDER BY e.exp_date DESC;
                """
            return DataBaseHandle.getRecords(query, 0, (from_date, to_date))
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def ExpenseById(exp_id):
        try:
            query = """
                    SELECT 
                        e.exp_id,
                        ext.ext_name,
                        pme.pme_name,
                        to_char(e.exp_date, 'DD/MM/YYYY HH24:MI:SS') AS date_expense,
                        CAST(e.exp_amount AS double precision),
                        e.exp_description,
                        e.exp_receipt_number,
                        e.user_created,
                        to_char(e.date_created, 'DD/MM/YYYY HH24:MI:SS') AS date_created,
                        e.user_modified,
                        to_char(e.date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified,
                        e.user_deleted,
                        to_char(e.date_deleted, 'DD/MM/YYYY HH24:MI:SS') AS date_deleted
                    FROM ceragen.admin_expense AS e
                    INNER JOIN ceragen.admin_payment_method AS pme ON e.exp_payment_method_id = pme.pme_id
                    INNER JOIN ceragen.admin_expense_type AS ext ON e.exp_type_id = ext.ext_id
                    WHERE e.exp_state = true AND e.exp_id = %s;
                """
            return DataBaseHandle.getRecords(query, 1, (exp_id,))
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def AddExpense(data):
        v_result = False
        v_message = None
        v_data = None
        try:
            sql = """
                    INSERT INTO ceragen.admin_expense (
                        exp_type_id, exp_payment_method_id, exp_date, exp_amount, 
                        exp_description, exp_receipt_number, exp_state, user_created, date_created
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING exp_id
                """
            record = (
                data["exp_type_id"],
                data["exp_payment_method_id"],
                data["exp_date"],
                data["exp_amount"],
                data.get("exp_description", None),
                data.get("exp_receipt_number", None),
                True,
                data["user_process"],
                datetime.now()
            )
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al insertar el gasto: {err}"
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def UpdateExpense(data):
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
    def DeleteExpense(exp_id, user):
        v_result = False
        v_message = None
        try:
            sql = """
                    UPDATE ceragen.admin_expense
                    SET exp_state = false, user_deleted = %s, date_deleted = %s
                    WHERE exp_id = %s
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
