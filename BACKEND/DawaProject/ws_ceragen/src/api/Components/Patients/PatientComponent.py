from ....utils.database.connection_db import DataBaseHandle
from ....utils.general.logs import HandleLogs
from ....utils.general.response import internal_response,response_success, response_error, response_not_found

from datetime import datetime


class PatientComponent:
    """
    Componente de lógica de negocio para la gestión de pacientes.
    Realiza operaciones CRUD directas con la base de datos.
    """

    @staticmethod
    def getAllPatients():
        """
        Obtiene todos los pacientes activos de la base de datos.
        """
        try:
            HandleLogs.write_log("Obteniendo todos los pacientes desde la DB (PatientComponent).")
            sql = """
                SELECT
                pat_id,
                pat_person_id,
                pat_client_id,
                pat_code,
                pat_medical_conditions,
                pat_allergies,
                pat_blood_type,
                pat_emergency_contact_name,
                pat_emergency_contact_phone,
                pat_state,
                to_char(date_created, 'DD/MM/YYYY HH24:MI:SS') as date_created,
                to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS') as date_modified,
                user_created,
                user_modified,
                user_deleted,
                date_deleted
                FROM ceragen.admin_patient
                WHERE pat_state = TRUE;
            """
            result_db = DataBaseHandle.getRecords(sql, 0)

            if result_db and result_db.get('result'):
                return result_db.get('data')
            else:
                HandleLogs.write_error(
                    f"Error o no hay datos al obtener todos los pacientes: {result_db.get('message', 'Desconocido')}")
                return None

        except Exception as err:
            HandleLogs.write_error(f"Error inesperado en PatientComponent.getAllPatients: {str(err)}")
            return None

    @staticmethod
    def getPatientById(patient_id):
        """
        Obtiene un paciente por su ID (pat_id) desde la base de datos.
        """
        try:
            HandleLogs.write_log(f"Obteniendo paciente con ID: {patient_id} desde la DB (PatientComponent).")

            sql = """
                    SELECT
                        pat_id,
                        pat_person_id,
                        pat_client_id,
                        pat_code,
                        pat_medical_conditions,
                        pat_allergies,
                        pat_blood_type,
                        pat_emergency_contact_name,
                        pat_emergency_contact_phone,
                        pat_state,
                        COALESCE(to_char(date_created, 'DD/MM/YYYY HH24:MI:SS'), '') AS date_created,
                        COALESCE(to_char(date_modified, 'DD/MM/YYYY HH24:MI:SS'), '') AS date_modified,
                        user_created,
                        user_modified,
                        user_deleted,
                        COALESCE(to_char(date_deleted, 'DD/MM/YYYY HH24:MI:SS'), '') AS date_deleted
                    FROM ceragen.admin_patient
                    WHERE pat_id = %s AND pat_state = true;
                    
    
                """
            params = (patient_id,)
            result_db = DataBaseHandle.getRecords(sql, 1, params)

            if result_db and result_db.get('result'):
                return result_db.get('data')
            else:
                HandleLogs.write_error(
                    f"Error o no hay datos al obtener todos los pacientes: {result_db.get('message', 'Desconocido')}")
                return None

        except Exception as err:
            HandleLogs.write_error(f"Error inesperado en PatientComponent.getAllPatients: {str(err)}")
            return None









    @staticmethod
    def createPatient(patient_data: dict):
        """
        Crea un nuevo paciente en la base de datos.
        """
        v_message = None
        v_result = False
        v_data = None
        try:
            user_process = patient_data.get('user_process', 'SYSTEM')
            HandleLogs.write_log(
                f"Creando paciente en la DB (PatientComponent) por {user_process} con datos: {patient_data}")

            sql = """
                INSERT INTO ceragen.admin_patient (
                    pat_person_id,
                    pat_client_id,        -- Columna OBLIGATORIA en admin_patient
                    pat_code,             -- Columna OPCIONAL en admin_patient
                    pat_medical_conditions,
                    pat_allergies,        -- Columna OPCIONAL en admin_patient
                    pat_blood_type,
                    pat_emergency_contact_name,
                    pat_emergency_contact_phone,
                    pat_state,
                    user_created,         -- Columna OBLIGATORIA en admin_patient
                    date_created
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, TRUE, %s, NOW())
                RETURNING pat_id;
            """
            record = (
                patient_data.get('patient_person_id'),
                patient_data.get('pat_client_id', 1),

                patient_data.get('pat_code', ''),
                patient_data.get('patient_medical_history'),
                patient_data.get('pat_allergies', ''),
                patient_data.get('patient_blood_type'),
                patient_data.get('patient_emergency_contact_name'),
                patient_data.get('patient_emergency_contact_phone'),
                user_process
            )
            result_db = DataBaseHandle.ExecuteNonQuery(sql, record)

            if result_db and result_db.get('result'):
                v_result = True
                v_data = result_db.get('data')  # El ID del nuevo paciente
                v_message = "Paciente creado exitosamente."
            else:
                v_message = result_db.get('message', "Error al crear paciente: Desconocido")
                HandleLogs.write_error(v_message)

        except Exception as err:
            HandleLogs.write_error(f"Error inesperado en PatientComponent.createPatient: {str(err)}")
            v_message = "Error interno del servidor al crear paciente: " + str(err)
        finally:
            return internal_response(v_result, v_message, v_data)


    @staticmethod
    def updatePatient(patient_data: dict):
        """
        Actualiza un paciente existente en la base de datos.
        """
        v_message = None
        v_result = False
        v_data = None
        try:
            patient_id = patient_data.get('patient_id')
            user_process = patient_data.get('user_process', 'SYSTEM')
            HandleLogs.write_log(
                f"Actualizando paciente en la DB (PatientComponent) por {user_process} con ID {patient_id} con datos: {patient_data}")

            # Construir la parte SET dinamica
            set_clauses = []
            record_values = []
            if 'patient_person_id' in patient_data:
                set_clauses.append("pat_person_id = %s")
                record_values.append(patient_data['patient_person_id'])
            if 'patient_client_id' in patient_data:
                set_clauses.append("pat_client_id = %s")
                record_values.append(patient_data['patient_client_id'])
            if 'patient_code' in patient_data:
                set_clauses.append("pat_code = %s")
                record_values.append(patient_data['patient_code'])
            if 'patient_medical_conditions' in patient_data:
                set_clauses.append("pat_medical_conditions = %s")
                record_values.append(patient_data['patient_medical_conditions'])
            if 'patient_allergies' in patient_data:
                set_clauses.append("pat_allergies = %s")
                record_values.append(patient_data['patient_allergies'])
            if 'patient_blood_type' in patient_data:
                set_clauses.append("pat_blood_type = %s")
                record_values.append(patient_data['patient_blood_type'])
            if 'patient_emergency_contact_name' in patient_data:
                set_clauses.append("pat_emergency_contact_name = %s")
                record_values.append(patient_data['patient_emergency_contact_name'])
            if 'patient_emergency_contact_phone' in patient_data:
                set_clauses.append("pat_emergency_contact_phone = %s")
                record_values.append(patient_data['patient_emergency_contact_phone'])
            if 'patient_state' in patient_data:
                set_clauses.append("pat_state = %s")
                record_values.append(patient_data['patient_state'])

            # Campos de auditoría (user_modified y date_modified)
            set_clauses.append("user_modified = %s")
            record_values.append(user_process)
            set_clauses.append("date_modified = NOW()")

            # Si no hay nada que actualizar (aparte del usuario y fecha de modificación)
            if not set_clauses:
                v_result = False
                v_message = "No se proporcionaron datos para actualizar el paciente."
                return internal_response(v_result, v_message, v_data)

            # Unir las cláusulas SET
            sql = f"""
                    UPDATE ceragen.admin_patient
                    SET {', '.join(set_clauses)}
                    WHERE pat_id = %s;
                """
            record_values.append(patient_id)  # Añadir el ID del paciente al final

            # Ejecutar la consulta
            result_db = DataBaseHandle.ExecuteNonQuery(sql, tuple(record_values))

            if result_db and result_db.get('result'):
                if result_db.get('data') > 0:  # data contendrá el número de filas afectadas
                    v_result = True
                    v_message = "Paciente actualizado exitosamente."
                    v_data = {"patient_id": patient_id}  # Retornar el ID del paciente actualizado
                else:
                    v_result = False
                    v_message = "No se encontró el paciente para actualizar o no hubo cambios."
            else:
                v_message = result_db.get('message', "Error al actualizar paciente: Desconocido")
                HandleLogs.write_error(v_message)

        except Exception as err:
            HandleLogs.write_error(f"Error inesperado en PatientComponent.updatePatient: {str(err)}")
            v_message = "Error interno del servidor al actualizar paciente: " + str(err)
        finally:
            return internal_response(v_result, v_message, v_data)

    @staticmethod
    def deletePatient(patient_id: int, user_process: str):
        """
        Realiza una eliminación lógica (desactivación) de un paciente por su ID.
        """
        v_message = None
        v_result = False
        v_data = 0  # Usaremos 0 para indicar 0 filas afectadas por defecto
        try:
            HandleLogs.write_log(
                f"Realizando eliminación lógica de paciente con ID: {patient_id} por {user_process} (PatientComponent).")
            sql = """
                UPDATE ceragen.admin_patient
                SET 
                    patient_state = FALSE, 
                    patient_update_date = NOW() 
                WHERE patient_id = %s AND patient_state = TRUE;
            """
            result_db = DataBaseHandle.ExecuteNonQuery(sql, (patient_id,))

            if result_db and result_db.get('result'):
                v_result = True
                v_data = result_db.get('data', 0)
                if v_data > 0:
                    v_message = f"Paciente con ID {patient_id} desactivado exitosamente."
                else:
                    v_message = f"Paciente con ID {patient_id} no encontrado o ya inactivo."
            else:
                v_message = result_db.get('message', f"Error al desactivar paciente con ID {patient_id}: Desconocido")
                HandleLogs.write_error(v_message)

        except Exception as err:
            HandleLogs.write_error(f"Error inesperado en PatientComponent.deletePatient: {str(err)}")
            v_message = "Error interno del servidor al eliminar paciente: " + str(err)
        finally:
            return internal_response(v_result, v_message, v_data)