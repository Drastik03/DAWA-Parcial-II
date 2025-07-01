from marshmallow import Schema, fields

class PatientResponse(Schema):
    pat_id = fields.Integer(dump_only=True) # dump_only significa que solo se usa para serialización (salida)
    pat_person_id = fields.Integer()
    pat_client_id = fields.Integer()
    pat_code = fields.String()
    pat_medical_conditions = fields.String()
    pat_allergies = fields.String()
    pat_blood_type = fields.String()
    pat_emergency_contact_name = fields.String()
    pat_emergency_contact_phone = fields.String()
    pat_state = fields.Boolean()
    user_created = fields.String()
    date_created = fields.DateTime(format="%d/%m/%Y %H:%M:%S") # Formato para salida
    user_modified = fields.String()
    date_modified = fields.DateTime(format="%d/%m/%Y %H:%M:%S")
    user_deleted = fields.String()
    date_deleted = fields.DateTime(format="%d/%m/%Y %H:%M:%S")

    first_name = fields.String(attribute='per_first_name')
    last_name = fields.String(attribute='per_last_name')
    identification_number = fields.String(
        attribute='per_identification_number')  # Asegúrate de que el alias coincida con tu SQL
    birth_date = fields.Date(attribute='per_birth_date', format="%d/%m/%Y")
    gender = fields.String(attribute='per_gender')
    email = fields.String(attribute='per_email')
    phone = fields.String(attribute='per_phone_number')
    address = fields.String(attribute='per_address')