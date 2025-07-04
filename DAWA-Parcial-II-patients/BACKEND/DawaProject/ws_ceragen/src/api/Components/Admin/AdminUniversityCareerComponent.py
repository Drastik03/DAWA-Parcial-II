from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from flask import Flask, jsonify, request
from datetime import datetime
from ....utils.general.response import internal_response

class University_Career_component:
    @staticmethod
    def ListAllUniversityCareer():
        try:
            query = "SELECT unitcar.id, unitcar.name, unit.id as id_academic_unit, unit.name as unit_name, unitcar.description, " \
                    "unitcar.title_granted, unitcar.phone_number, unitcar.address, unitcar.manager_name," \
                    "unitcar.web_site, unitcar.mail_address, unitcar.state, unitcar.user_created, " \
                    "to_char(unitcar.date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created, " \
                    "unitcar.user_modified, to_char(unitcar.date_modified, 'DD/MM/YYYY HH24:MI:SS') as date_modified, " \
                    "unitcar.user_deleted, unitcar.date_deleted, unit.name as unit_name " \
                    "FROM ceragen.admin_university_career unitcar " \
                    "INNER JOIN ceragen.admin_academy_unit unit on unit.id = unitcar.id_academic_unit " \
                    "WHERE unitcar.state = true"

            res = DataBaseHandle.getRecords(query, 0)
            return res
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def GetUniversityCareerById(id):
        try:
            query = "SELECT id, name, id_academic_unit, description, title_granted, phone_number, address, " \
                    "manager_name, web_site, mail_address, state, user_created, " \
                    "to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created, " \
                    "user_modified, date_modified, user_deleted, date_deleted " \
                    "FROM ceragen.admin_university_career where id = %s"
            record = (id,)
            res = DataBaseHandle.getRecords(query, 1, record)
            return res
        except Exception as err:
            HandleLogs.write_error(err)
            return None

    @staticmethod
    def AddAUniversityCareer(data_to_insert):
        try:
            v_message = None
            v_result = False
            v_data = None
            sql = "INSERT INTO ceragen.admin_university_career( name, id_academic_unit, description, title_granted, " \
	              "phone_number, address, manager_name, web_site, mail_address, state, user_created, date_created) " \
	              "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) "

            record = (data_to_insert['name'], data_to_insert['id_academic_unit'], data_to_insert['description'],
                      data_to_insert['title_granted'], data_to_insert['phone_number'], data_to_insert['address'],
                      data_to_insert['manager_name'], data_to_insert['web_site'], data_to_insert['mail_address'], True,
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
    def UpdateUniversityCareer(data_to_update):
        try:
            v_message = None
            v_result = False
            v_data = None
            sql = "UPDATE ceragen.admin_university_career " \
	              "SET name=%s, id_academic_unit=%s, description=%s, title_granted=%s, phone_number=%s, " \
                  "address=%s, manager_name=%s, web_site=%s, mail_address=%s, " \
                  "user_modified=%s, date_modified=%s " \
	              "WHERE id = %s"

            record = (data_to_update['name'], data_to_update['id_academic_unit'], data_to_update['description'],
                      data_to_update['title_granted'], data_to_update['phone_number'], data_to_update['address'],
                      data_to_update['manager_name'], data_to_update['web_site'], data_to_update['mail_address'],
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
    def DeleteUniversityCareer(id, p_user):
        try:
            query = "UPDATE ceragen.admin_university_career " \
                     "SET state = false, user_deleted = %s, date_deleted = %s WHERE id = %s"
            record = (p_user, datetime.now(), id)
            rows_affected = DataBaseHandle.ExecuteNonQuery(query, record)
            HandleLogs.write_log("Filas afectadas: " + str(rows_affected))

            if rows_affected['data'] > 0:
                return True, f"Registro con ID {id} eliminado exitosamente."
            else:
                return False, f"No se encontró ningún registro con ID {id}."
        except Exception as err:
            HandleLogs.write_error(err)
            return None
