from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from datetime import datetime
from ....utils.general.response import internal_response

class TherapyTypeComponent:
    @staticmethod
    def ListAllTherapyTypes():
        try:
            query = """
                SELECT tht_id, tht_name, tht_description, tht_state, 
                       user_created, to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created, 
                       user_modified, to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') as date_modified, 
                       user_deleted, to_char(date_deleted, 'DD/MM/YYYY HH24:MI:SS') as date_deleted 
                FROM ceragen.admin_therapy_type 
                WHERE tht_state = true
            """
            return DataBaseHandle.getRecords(query, 0)
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def GetTherapyTypeById(tht_id):
        try:
            query = """
                   SELECT tht_id, tht_name, tht_description, tht_state, 
                          user_created, to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created, 
                          user_modified, to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') as date_modified, 
                          user_deleted, to_char(date_deleted, 'DD/MM/YYYY HH24:MI:SS') as date_deleted 
                   FROM ceragen.admin_therapy_type 
                   WHERE tht_id = %s
               """
            return DataBaseHandle.getRecords(query, 1, (tht_id,))
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def AddTherapyType(data):
        v_result = False
        v_message = None
        v_data = None
        try:
            sql = """
                   INSERT INTO ceragen.admin_therapy_type (
                       tht_name, tht_description, tht_state, user_created, date_created
                   ) VALUES (%s, %s, %s, %s, %s)
                   RETURNING tht_id
               """
            record = (
                data["tht_name"],
                data["tht_description"],
                True,
                data["user_process"],
                datetime.now()
            )
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al insertar tipo de terapia: {err}"
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def UpdateTherapyType(data):
        v_result = False
        v_message = None
        v_data = None
        try:
            sql = """
                    UPDATE ceragen.admin_therapy_type 
                    SET tht_name = %s, tht_description = %s, 
                        user_modified = %s, date_modified = %s 
                    WHERE tht_id = %s
                """
            record = (
                data["tht_name"],
                data["tht_description"],
                data["user_created"],
                datetime.now(),
                data["tht_id"]
            )
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al actualizar tipo de terapia: {err}"
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def DeleteTherapyType(tht_id, user):
        try:
            sql = """
                    UPDATE ceragen.admin_therapy_type 
                    SET tht_state = false, user_deleted = %s, date_deleted = %s 
                    WHERE tht_id = %s
                """
            record = (user, datetime.now(), tht_id)
            rows_affected = DataBaseHandle.ExecuteNonQuery(sql, record)
            HandleLogs.write_log("Filas afectadas: " + str(rows_affected))

            if rows_affected["data"] > 0:
                return True, f"Registro con ID {tht_id} eliminado exitosamente."
            else:
                return False, f"No se encontró ningún registro con ID {tht_id}."
        except Exception as err:
            HandleLogs.write_error(err)
            return None