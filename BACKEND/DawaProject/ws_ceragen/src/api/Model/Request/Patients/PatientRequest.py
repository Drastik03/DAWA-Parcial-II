from marshmallow import Schema, fields, validate

class PatientInsertRequest(Schema):
    """
    Esquema para validar datos al insertar un paciente en ceragen.admin_patient.
    """
    pat_person_id = fields.Int(required=True)
    pat_client_id = fields.Int(required=True)
    pat_code = fields.String(required=False, allow_none=True, validate=validate.Length(max=50))
    pat_medical_conditions = fields.String(required=False, allow_none=True)
    pat_allergies = fields.String(required=False, allow_none=True)
    pat_blood_type = fields.String(required=False, allow_none=True, validate=validate.Length(max=5))
    pat_emergency_contact_name = fields.String(required=False, allow_none=True, validate=validate.Length(max=255))
    pat_emergency_contact_phone = fields.String(required=False, allow_none=True, validate=validate.Length(min=7, max=15))
    user_process = fields.String(required=True, validate=validate.Length(min=1))


class PatientUpdateRequest(Schema):
    """
    Esquema para validar datos al actualizar un paciente existente.
    """
    pat_id = fields.Int(required=True)

    pat_person_id = fields.Int(required=False, allow_none=True)
    pat_client_id = fields.Int(required=False, allow_none=True)
    pat_code = fields.String(required=False, allow_none=True, validate=validate.Length(max=50))
    pat_medical_conditions = fields.String(required=False, allow_none=True)
    pat_allergies = fields.String(required=False, allow_none=True)
    pat_blood_type = fields.String(required=False, allow_none=True, validate=validate.Length(max=5))
    pat_emergency_contact_name = fields.String(required=False, allow_none=True, validate=validate.Length(max=255))
    pat_emergency_contact_phone = fields.String(required=False, allow_none=True, validate=validate.Length(min=7, max=15))
    pat_state = fields.Bool(required=False, allow_none=True)

    user_process = fields.String(required=True, validate=validate.Length(min=1))