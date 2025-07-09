from datetime import datetime
from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.response import internal_response

class AdminTaxComponent:
    @staticmethod
    def ListAllTaxes():
        try:
            query = """
                SELECT 
                    tax_id,
                    tax_name,
                    tax_percentage,
                    tax_description,
                    tax_state,
                    user_created,
                    TO_CHAR(date_created, 'DD/MM/YYYY HH24:MI:SS') AS date_created,
                    user_modified,
                    TO_CHAR(date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified,
                    user_deleted,
                    TO_CHAR(date_deleted, 'DD/MM/YYYY HH24:MI:SS') AS date_deleted
                FROM ceragen.admin_tax
                WHERE tax_state = true
            """
            return DataBaseHandle.getRecords(query, 0)
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def GetTaxById(tax_id):
        try:
            query = """
                SELECT 
                    tax_id,
                    tax_name,
                    tax_percentage,
                    tax_description,
                    tax_state,
                    user_created,
                    TO_CHAR(date_created, 'DD/MM/YYYY HH24:MI:SS') AS date_created,
                    user_modified,
                    TO_CHAR(date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified,
                    user_deleted,
                    TO_CHAR(date_deleted, 'DD/MM/YYYY HH24:MI:SS') AS date_deleted
                FROM ceragen.admin_tax
                WHERE tax_state = true AND tax_id = %s
            """
            return DataBaseHandle.getRecords(query, 1, (tax_id,))
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def AddTax(data):
        v_result = False
        v_message = None
        v_data = None
        try:
            sql = """
                INSERT INTO ceragen.admin_tax (
                    tax_name, tax_percentage, tax_description,
                    tax_state, user_created, date_created
                ) VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING tax_id
            """
            record = (
                data["tax_name"],
                data["tax_percentage"],
                data.get("tax_description", None),
                True,
                data["user_process"],
                datetime.now()
            )
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al insertar el impuesto: {err}"
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def UpdateTax(data):
        v_result = False
        v_message = None
        v_data = None
        try:
            sql = """
                UPDATE ceragen.admin_tax 
                SET tax_name = %s, tax_percentage = %s, tax_description = %s,
                    user_modified = %s, date_modified = %s
                WHERE tax_id = %s
            """
            record = (
                data["tax_name"],
                data["tax_percentage"],
                data.get("tax_description", None),
                data["user_process"],
                datetime.now(),
                data["tax_id"]
            )
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al actualizar el impuesto: {err}"
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def DeleteTax(tax_id, user):
        v_result = False
        v_message = None
        try:
            sql = """
                UPDATE ceragen.admin_tax
                SET tax_state = false, user_deleted = %s, date_deleted = %s
                WHERE tax_id = %s
            """
            record = (user, datetime.now(), tax_id)
            rows_affected = DataBaseHandle.ExecuteNonQuery(sql, record)
            HandleLogs.write_log("Filas afectadas: " + str(rows_affected))
            if rows_affected["data"] > 0:
                v_result = True
                v_message = f"Impuesto con ID {tax_id} eliminado exitosamente."
            else:
                v_message = f"No se encontró ningún impuesto con ID {tax_id}."
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al eliminar el impuesto: {err}"
        finally:
            return internal_response(v_result, v_message, None)
