from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from datetime import datetime
from flask import Flask, jsonify, request
from ....utils.general.response import internal_response

class Person_genre_Component:
    @staticmethod
    def ListAllPersonGenre():
        try:
            query = "select id, genre_name, state, user_created, " \
                    "to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created, " \
                    "user_modified, to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') as date_modified, user_deleted, date_deleted " \
                    "FROM ceragen.admin_person_genre where state = true"
            res = DataBaseHandle.getRecords(query, 0)
            return res
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def GetPersonGenreById(id):
        try:
            query = "select id, genre_name, state, user_created, " \
                    "to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created, " \
                    "user_modified, date_modified, user_deleted, date_deleted " \
                    "FROM ceragen.admin_person_genre where id = %s"
            record = (id,)
            res = DataBaseHandle.getRecords(query, 1, record)
            return res
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def AddAPersonGenre(data_to_insert):
        try:
            v_message = None
            v_result = False
            v_data = None
            sql = "INSERT INTO ceragen.admin_person_genre( genre_name, state, " \
	              "user_created, date_created) " \
	              "VALUES (%s,%s,%s,%s) "

            record = (data_to_insert['genre_name'], True,
                      data_to_insert['user_process'], datetime.now())

            # Execute the UPDATE query
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True

        except Exception as err:
            HandleLogs.write_error(err)
            v_message = "Error al Actualizar registro: " + str(err)
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def UpdatePersonGenre(data_to_update):
        try:
            v_message = None
            v_result = False
            v_data = None
            sql = "UPDATE ceragen.admin_person_genre " \
	              "SET genre_name=%s, user_modified=%s, date_modified=%s " \
                  "WHERE id = %s"

            record = (data_to_update['genre_name'],
                      data_to_update['user_process'], datetime.now(), data_to_update['id'])

            # Execute the UPDATE query
            v_data = DataBaseHandle.ExecuteNonQuery(sql, record)
            if v_data is not None:
                v_result = True

        except Exception as err:
            HandleLogs.write_error(err)
            v_message = "Error al Actualizar registro: " + str(err)
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def DeletePersonGenre(id, p_user):
        try:
            query = "UPDATE ceragen.admin_person_genre " \
                     "SET state = false, user_deleted = %s, date_deleted = %s WHERE id = %s"
            record = (p_user, datetime.now(), id)
            rows_affected = DataBaseHandle.ExecuteNonQuery(query, record)
            HandleLogs.write_log("Filas afectadas: " + str(rows_affected))

            if rows_affected > 0:
                return True, f"Registro con ID {id} eliminado exitosamente."
            else:
                return False, f"No se encontró ningún registro con ID {id}."
        except Exception as err:
            HandleLogs.write_error(err)
            return None

