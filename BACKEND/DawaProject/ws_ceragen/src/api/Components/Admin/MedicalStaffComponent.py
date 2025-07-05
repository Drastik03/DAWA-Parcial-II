from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from datetime import datetime
from ....utils.general.response import internal_response

class MedicalStaffComponent:

    @staticmethod
    def createMedicalStaff(data: dict):

        try:
            HandleLogs.write_log(f"Iniciando creación de personal médico en componente.")

            # Validaciones básicas de campos obligatorios (Marshmallow hará una validación más robusta en el servicio)
            required_fields = ['med_person_id', 'med_type_id', 'user_created']
            for field in required_fields:
                if field not in data:
                    return internal_response(False, f"Campo '{field}' es requerido para la creación.", None)

            fields = []
            placeholders = []
            params = []

            # Campos obligatorios y con valores predeterminados
            fields.append("med_person_id")
            placeholders.append("%s")
            params.append(data['med_person_id'])

            fields.append("med_type_id")
            placeholders.append("%s")
            params.append(data['med_type_id'])

            fields.append("user_created")
            placeholders.append("%s")
            params.append(data['user_created'])

            fields.append("date_created")
            placeholders.append("CURRENT_TIMESTAMP")

            # Campos opcionales
            if 'med_registration_number' in data:
                fields.append("med_registration_number")
                placeholders.append("%s")
                params.append(data['med_registration_number'])

            if 'med_specialty' in data:
                fields.append("med_specialty")
                placeholders.append("%s")
                params.append(data['med_specialty'])

            if 'med_state' in data:
                fields.append("med_state")
                placeholders.append("%s")
                params.append(data['med_state'])
            else:
                pass

            sql = f"""
                INSERT INTO ceragen.admin_medical_staff ({', '.join(fields)})
                VALUES ({', '.join(placeholders)})
                RETURNING med_id;
            """

            result_db = DataBaseHandle.ExecuteInsert(sql, tuple(params))

            if result_db.get('result') and result_db.get('data'):
                new_id = result_db['data'][0]['med_id']
                HandleLogs.write_log(f"Personal médico creado con ID: {new_id}.")
                return internal_response(True, "Personal médico creado exitosamente.", {"med_id": new_id})
            else:
                return internal_response(False, result_db.get('message', 'Error desconocido al crear personal médico'),
                                         None)

        except Exception as e:
            HandleLogs.write_error(f"Error en MedicalStaffComponent.createMedicalStaff: {str(e)}")
            return internal_response(False, "Error interno del servidor al crear personal médico", None)

    @staticmethod
    def getMedicalStaffById(med_id: int):
        try:
            HandleLogs.write_log(f"Obteniendo personal médico con ID: {med_id}.")

            sql = """
                SELECT med_id, med_person_id, med_type_id, med_registration_number, med_specialty,
                       med_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted
                FROM ceragen.admin_medical_staff
                WHERE med_id = %s;
            """
            params = (med_id,)
            result_db = DataBaseHandle.getRecords(sql, 1, params)  # 1 para un solo registro

            if not result_db.get('result'):
                return internal_response(False, result_db.get('message', "Error al obtener personal médico."), None)

            data_from_db = result_db.get('data')  # Accede a la clave 'data'

            if not data_from_db:  # Si no se encontraron datos
                return internal_response(False, f"Personal médico con ID {med_id} no encontrado.", None)

            clean_data = data_from_db[0] if isinstance(data_from_db, list) else data_from_db

            return internal_response(True, "Personal médico obtenido exitosamente.", clean_data)

        except Exception as err:
            HandleLogs.write_error(f"Error inesperado en MedicalStaffComponent.getMedicalStaffById: {str(err)}")
            return internal_response(False, "Error interno del servidor al obtener personal médico", None)

    @staticmethod
    def getAllMedicalStaff():
        try:
            HandleLogs.write_log(f"Obteniendo todos los registros de personal médico activo en componente.")

            sql = """
                    SELECT med_id, med_person_id, med_type_id, med_registration_number, med_specialty,
                           med_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted
                    FROM ceragen.admin_medical_staff
                    WHERE med_state = TRUE
                    ORDER BY med_id ASC;
                """

            result_db = DataBaseHandle.getRecords(sql, 0)  # 0 para obtener todos los registros

            if result_db.get('result') and result_db.get('data') is not None:
                return internal_response(True, "Lista de personal médico obtenida exitosamente.", result_db['data'])
            else:
                message = result_db.get('message', 'Error al consultar lista de personal médico o no hay registros.')
                HandleLogs.write_error(f"Error o no hay registros activos de personal médico: {message}")
                return internal_response(False, message, None)

        except Exception as e:
            HandleLogs.write_error(f"Error en MedicalStaffComponent.getAllMedicalStaff: {str(e)}")
            return internal_response(False, "Error interno del servidor al obtener lista de personal médico", None)


    @staticmethod
    def updateMedicalStaff(med_id: int, data: dict):
        try:
            HandleLogs.write_log(f"Actualizando personal médico con ID: {med_id} - Inicio del componente.")

            if not data:
                return internal_response(False, "No se proporcionaron datos para actualizar.", None)

            if 'user_modified' not in data or not data['user_modified']:
                return internal_response(False, "El campo 'user_modified' es requerido para la actualización.", None)

            forbidden_fields = ['med_id', 'user_created', 'date_created', 'user_deleted', 'date_deleted',
                                'user_modified']

            set_clauses = []
            params = []

            for field, value in data.items():
                if field not in forbidden_fields:
                    set_clauses.append(f"{field} = %s")
                    params.append(value)

            set_clauses.append("user_modified = %s")
            params.append(data['user_modified'])
            set_clauses.append("date_modified = CURRENT_TIMESTAMP")

            if not set_clauses:
                return internal_response(False, "No se proporcionaron datos válidos para actualizar.", None)

            sql = f"""
                    UPDATE ceragen.admin_medical_staff
                    SET {', '.join(set_clauses)}
                    WHERE med_id = %s;
                """
            params.append(med_id)

            result_db = DataBaseHandle.ExecuteNonQuery(sql, tuple(params))

            HandleLogs.write_log(f"Resultado de ExecuteNonQuery para update: {result_db}")

            if result_db.get('result'):
                message = "Personal médico actualizado exitosamente."
                if result_db.get('res', 0) == 0:
                    message = "Personal médico encontrado, pero no se realizaron cambios (datos idénticos)."

                return internal_response(True, message, {"med_id": med_id})
            else:
                return internal_response(False,
                                         result_db.get('message', 'Error desconocido al actualizar personal médico'),
                                         None)

        except Exception as e:
            HandleLogs.write_error(f"Error en MedicalStaffComponent.updateMedicalStaff: {str(e)}")
            return internal_response(False, "Error interno del servidor al actualizar personal médico", None)

    @staticmethod
    def deleteMedicalStaff(med_id: int, user_deleted: str):
        try:
            if not user_deleted:
                return internal_response(False,
                                         "El usuario que elimina el registro es requerido para la eliminación lógica.",
                                         None)

            HandleLogs.write_log(
                f"Inactivando personal médico con ID {med_id} por el usuario {user_deleted} en componente.")

            sql = """
                    UPDATE ceragen.admin_medical_staff
                    SET med_state = FALSE,
                        user_deleted = %s,
                        date_deleted = CURRENT_TIMESTAMP
                    WHERE med_id = %s AND med_state = TRUE; -- Asegura que solo se desactiven registros activos
                """
            params = (user_deleted, med_id)

            result_db = DataBaseHandle.ExecuteNonQuery(sql, params)
            HandleLogs.write_log(f"Resultado de ExecuteNonQuery para eliminar: {result_db}")

            if result_db.get('result'):
                mensaje = "Personal médico inactivado exitosamente."
                if result_db.get('res', 0) == 0:
                    mensaje = "Personal médico no encontrado o ya estaba inactivo."

                return internal_response(True, mensaje, None)
            else:
                return internal_response(False,
                                         result_db.get('message', 'Error desconocido al inactivar personal médico'),
                                         None)

        except Exception as e:
            HandleLogs.write_error(f"Error en MedicalStaffComponent.deleteMedicalStaff: {str(e)}")
            return internal_response(False, "Error interno del servidor al inactivar personal médico", None)
