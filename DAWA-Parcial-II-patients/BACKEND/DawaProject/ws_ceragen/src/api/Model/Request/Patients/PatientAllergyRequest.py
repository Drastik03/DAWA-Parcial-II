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

class PatientAllergyDeleteRequest(Schema):
    pa_id = fields.Int(required=True)
    user_modified = fields.Str(required=True)

class PatientAllergyGetByIdRequest(Schema):
    pa_id = fields.Int(required=True)

class PatientAllergyListRequest(Schema):
    # Puedes extenderlo con filtros opcionales:
    pa_patient_id = fields.Int(required=False)
    pa_allergy_id = fields.Int(required=False)
