from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from datetime import datetime
from ....utils.general.response import internal_response

class MedicalStaffComponent:

    @staticmethod
    def createMedicalStaff(data: dict):
        try:
            HandleLogs.write_log("Iniciando creación de personal médico en componente.")
            required_fields = ['med_person_id', 'med_type_id', 'user_created']
            for field in required_fields:
                if field not in data:
                    return internal_response(False, f"Campo '{field}' es requerido para la creación.", None)

            med_registration_number = MedicalStaffComponent.generate_next_medicalstaff_code()

            fields = ["med_registration_number", "med_person_id", "med_type_id", "user_created", "date_created"]
            placeholders = ["%s", "%s", "%s", "%s", "CURRENT_TIMESTAMP"]
            params = [
                med_registration_number,
                data['med_person_id'],
                data['med_type_id'],
                data['user_created']
            ]

            optional_fields = ['med_specialty', 'med_state']
            for field in optional_fields:
                if field in data:
                    fields.append(field)
                    placeholders.append("%s")
                    params.append(data[field])

            sql = f"""
                INSERT INTO ceragen.admin_medical_staff ({', '.join(fields)})
                VALUES ({', '.join(placeholders)})
                RETURNING med_id, med_registration_number;
            """

            result_db = DataBaseHandle.ExecuteInsert(sql, tuple(params))
            if result_db and result_db.get('result') and result_db.get('data'):
                new_record = result_db['data'][0]
                HandleLogs.write_log(
                    f"Personal médico creado con ID: {new_record['med_id']} y código: {new_record['med_registration_number']}.")
                return internal_response(True, "Personal médico creado exitosamente.", new_record)

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
            result_db = DataBaseHandle.getRecords(sql, 1, params)

            if not result_db or not result_db.get('result'):
                return internal_response(False, result_db.get('message', "Error al obtener personal médico."), None)

            data_from_db = result_db.get('data')
            if not data_from_db:
                return internal_response(False, f"Personal médico con ID {med_id} no encontrado.", None)

            clean_data = data_from_db[0] if isinstance(data_from_db, list) else data_from_db
            return internal_response(True, "Personal médico obtenido exitosamente.", clean_data)

        except Exception as err:
            HandleLogs.write_error(f"Error inesperado en MedicalStaffComponent.getMedicalStaffById: {str(err)}")
            return internal_response(False, "Error interno del servidor al obtener personal médico", None)

    @staticmethod
    def ListAllMedicalStaff():
        try:
            HandleLogs.write_log("Obteniendo todos los registros de personal médico activo.")

            sql = """
                SELECT
                    mf.med_id,
                    p.per_names AS person_names,
                    p.per_surnames AS person_surnames,
                    mf.med_person_id,
                    mf.med_type_id,
                    mf.med_registration_number,
                    mf.med_specialty,
                    mf.med_state,
                    mf.user_created,
                    to_char(mf.date_created, 'YYYY-MM-DD HH24:MI:SS') AS date_created,
                    mf.user_modified,
                    to_char(mf.date_modified, 'YYYY-MM-DD HH24:MI:SS') AS date_modified,
                    mf.user_deleted,
                    to_char(mf.date_deleted, 'YYYY-MM-DD HH24:MI:SS') AS date_deleted
                FROM ceragen.admin_medical_staff mf
                INNER JOIN ceragen.admin_person p ON mf.med_person_id = p.per_id
                WHERE mf.med_state = TRUE
                ORDER BY mf.med_id ASC;
            """
            result_db = DataBaseHandle.getRecords(sql, 0)
            if not result_db or not result_db.get('result'):
                return internal_response(False, result_db.get('message', "Error al obtener personal médico."), None)

            return internal_response(True, "Listado de personal médico obtenido exitosamente.", result_db.get('data'))

        except Exception as err:
            HandleLogs.write_error(f"Error en MedicalStaffComponent.ListAllMedicalStaff: {err}")
            return internal_response(False, "Error interno al obtener personal médico", None)

    @staticmethod
    def updateMedicalStaff(med_id: int, data: dict):
        try:
            HandleLogs.write_log(f"Actualizando personal médico con ID: {med_id} - Inicio del componente.")

            if not data:
                return internal_response(False, "No se proporcionaron datos para actualizar.", None)

            if 'user_modified' not in data or not data['user_modified']:
                return internal_response(False, "El campo 'user_modified' es requerido para la actualización.", None)

            forbidden_fields = ['med_id', 'user_created', 'date_created', 'user_deleted', 'date_deleted']

            set_clauses = []
            params = []
            # Opción 1: Actualizar med_code si viene en data
            if 'med_code' in data:
                set_clauses.append("med_code = %s")
                params.append(data['med_code'])


            for field, value in data.items():
                if field not in forbidden_fields and field not in ['user_modified', 'med_code']:
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

            return internal_response(False, result_db.get('message', 'Error desconocido al actualizar personal médico'),
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

            HandleLogs.write_log(f"Inactivando personal médico con ID {med_id} por el usuario {user_deleted} en componente.")

            sql = """
                UPDATE ceragen.admin_medical_staff
                SET med_state = FALSE,
                    user_deleted = %s,
                    date_deleted = CURRENT_TIMESTAMP
                WHERE med_id = %s AND med_state = TRUE;
            """
            params = (user_deleted, med_id)

            result_db = DataBaseHandle.ExecuteNonQuery(sql, params)
            HandleLogs.write_log(f"Resultado de ExecuteNonQuery para eliminar: {result_db}")

            if result_db.get('result'):
                mensaje = "Personal médico inactivado exitosamente."
                if result_db.get('res', 0) == 0:
                    mensaje = "Personal médico no encontrado o ya estaba inactivo."
                return internal_response(True, mensaje, None)

            return internal_response(False, result_db.get('message', 'Error desconocido al inactivar personal médico'), None)

        except Exception as e:
            HandleLogs.write_error(f"Error en MedicalStaffComponent.deleteMedicalStaff: {str(e)}")
            return internal_response(False, "Error interno del servidor al inactivar personal médico", None)

    @staticmethod
    def generate_next_medicalstaff_code():
        try:
            sql = """
                SELECT LPAD(
                    CAST(
                        COALESCE(
                            MAX(CAST(SUBSTRING(med_registration_number, 4) AS INTEGER)),
                            0
                        ) + 1 AS TEXT
                    ),
                    6,
                    '0'
                ) AS next_number
                FROM ceragen.admin_medical_staff
                WHERE med_registration_number LIKE 'MS-%'
            """
            result = DataBaseHandle.getRecords(sql, 1)
            if result and result.get("data"):
                return f"MS-{result['data']['next_number']}"
            return "MS-000001"
        except Exception as err:
            HandleLogs.write_error(f"Error generating medical staff code: {err}")
            return "MS-000001"

