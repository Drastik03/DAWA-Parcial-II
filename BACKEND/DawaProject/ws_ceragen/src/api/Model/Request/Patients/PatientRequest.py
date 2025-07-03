from marshmallow import Schema, fields, validate

class PatientInsertRequest(Schema):
    pat_person_id = fields.Int(required=True)
    pat_client_id = fields.Int(required=True)
    pat_code = fields.Str(required=False, allow_none=True)
    pat_medical_conditions = fields.Str(required=True)
    pat_allergies = fields.Str(required=False, allow_none=True)
    pat_blood_type = fields.Str(required=False, allow_none=True)
    pat_emergency_contact_name = fields.Str(required=True)
    pat_emergency_contact_phone = fields.Str(required=True)

    user_created = fields.Str(required=False)


class PatientUpdateRequest(Schema):
    pat_person_id = fields.Int(required=True)
    pat_client_id = fields.Int(required=True)
    pat_code = fields.Str(required=False, allow_none=True, missing='')
    pat_medical_conditions = fields.Str(required=False, allow_none=True, missing='')
    pat_allergies = fields.Str(required=False, allow_none=True, missing='')
    pat_blood_type = fields.Str(required=False, allow_none=True)
    pat_emergency_contact_name = fields.Str(required=False, allow_none=True)
    pat_emergency_contact_phone = fields.Str(required=False, allow_none=True)
    user_modified = fields.Str(required=True, validate=validate.Length(min=1))