from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from datetime import datetime
from ....utils.general.response import internal_response


class MedicPersonTypeComponent:

    @staticmethod
    def ListAllMedicPersonTypes():
        try:
            query = """
                SELECT mpt_id, mpt_name, mpt_description, mpt_state,
                       user_created, to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') AS date_created,
                       user_modified, to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified,
                       user_deleted, to_char(date_deleted, 'DD/MM/YYYY HH24:MI:SS') AS date_deleted
                FROM ceragen.admin_medic_person_type
                WHERE mpt_state = true
            """
            return DataBaseHandle.getRecords(query, 0)
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def GetMedicPersonTypeById(mpt_id):
        try:
            query = """
                SELECT mpt_id, mpt_name, mpt_description, mpt_state,
                       user_created, to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') AS date_created,
                       user_modified, to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') AS date_modified,
                       user_deleted, to_char(date_deleted, 'DD/MM/YYYY HH24:MI:SS') AS date_deleted
                FROM ceragen.admin_medic_person_type
                WHERE mpt_id = %s
            """
            return DataBaseHandle.getRecords(query, 1, (mpt_id,))
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def AddMedicPersonType(data):
        v_result = False
        v_message = None
        v_data = None
        try:
            sql = """
                INSERT INTO ceragen.admin_medic_person_type (
                    mpt_name, mpt_description, mpt_state, user_created, date_created
                ) VALUES (%s, %s, %s, %s, %s)
                RETURNING mpt_id
            """
            record = (
                data["mpt_name"],
                data["mpt_description"],
                True,
                data["user_process"],
                datetime.now()
            )
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al insertar tipo de personal médico: {err}"
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def UpdateMedicPersonType(data):
        v_result = False
        v_message = None
        v_data = None
        try:
            sql = """
                UPDATE ceragen.admin_medic_person_type
                SET mpt_name = %s, mpt_description = %s,
                    user_modified = %s, date_modified = %s
                WHERE mpt_id = %s
            """
            record = (
                data["mpt_name"],
                data["mpt_description"],
                data["user_process"],
                datetime.now(),
                data["mpt_id"]
            )
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True
        except Exception as err:
            HandleLogs.write_error(err)
            v_message = f"Error al actualizar tipo de personal médico: {err}"
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def DeleteMedicPersonType(mpt_id, user):
        try:
            sql = """
                UPDATE ceragen.admin_medic_person_type
                SET mpt_state = false, user_deleted = %s, date_deleted = %s
                WHERE mpt_id = %s
            """
            record = (user, datetime.now(), mpt_id)
            rows_affected = DataBaseHandle.ExecuteNonQuery(sql, record)
            HandleLogs.write_log("Filas afectadas (mpt): " + str(rows_affected))

            if rows_affected["data"] > 0:
                return True, f"Registro con ID {mpt_id} eliminado exitosamente."
            else:
                return False, f"No se encontró ningún registro con ID {mpt_id}."
        except Exception as err:
            HandleLogs.write_error(err)
            return None
