from marshmallow import Schema, fields

class PatientDiseaseInsertRequest(Schema):
    pd_patient_id = fields.Int(required=True)
    pd_disease_id = fields.Int(required=True)
    pd_diagnosis_description = fields.Str(required=False, allow_none=True)
    pd_observation = fields.Str(required=False, allow_none=True)
    user_created = fields.Str(required=True)

class PatientDiseaseUpdateRequest(Schema):
    pd_id = fields.Int(required=True)
    pd_patient_id = fields.Int(required=True)
    pd_disease_id = fields.Int(required=True)
    pd_diagnosis_description = fields.Str(required=False, allow_none=True)
    pd_observation = fields.Str(required=False, allow_none=True)
    user_modified = fields.Str(required=True)

class PatientDiseaseDeleteRequest(Schema):
    pd_id = fields.Int(required=True)
    user_modified = fields.Str(required=True)
