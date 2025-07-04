from marshmallow import Schema, fields

class PatientDiseaseInsertRequest(Schema):
    pd_patient_id = fields.Int(required=True)
    pd_disease_id = fields.Int(required=True)
    pd_notes = fields.Str(allow_none=True)
    user_created = fields.Str(required=True)

class PatientDiseaseUpdateRequest(Schema):
    pd_disease_id = fields.Int(required=True)
    pd_notes = fields.Str(allow_none=True)
    pd_is_current = fields.Bool(required=True)
    user_modified = fields.Str(required=True)
