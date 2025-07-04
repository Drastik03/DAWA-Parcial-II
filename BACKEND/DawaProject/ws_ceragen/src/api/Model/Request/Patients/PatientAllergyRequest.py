from marshmallow import Schema, fields

class PatientAllergyInsertRequest(Schema):
    pa_patient_id = fields.Int(required=True)
    pa_allergy_id = fields.Int(required=True)
    pa_reaction_description = fields.Str(required=False, allow_none=True)
    user_created = fields.Str(required=True)

class PatientAllergyUpdateRequest(Schema):
    pa_patient_id = fields.Int(required=True)
    pa_allergy_id = fields.Int(required=True)
    pa_reaction_description = fields.Str(required=False, allow_none=True)
    user_modified = fields.Str(required=True)
