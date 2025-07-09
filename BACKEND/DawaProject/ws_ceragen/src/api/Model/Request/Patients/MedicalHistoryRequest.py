from marshmallow import Schema, fields, validate
from marshmallow.validate import Length

class MedicalHistoryInsertRequest(Schema):
    hist_id = fields.Int(required=False, validate=validate.Range(min=1))
    hist_patient_id = fields.Int(required=True, validate=validate.Range(min=1))
    hist_primary_complaint = fields.Str(required=True, validate=Length(min=1, max=1000))
    hist_onset_date = fields.Date(required=False, allow_none=True, format='%Y-%m-%d')
    hist_related_trauma = fields.Bool(required=False, allow_none=True)
    hist_current_treatment = fields.Str(required=False, allow_none=True, validate=Length(max=1000))
    hist_notes = fields.Str(required=False, allow_none=True, validate=Length(max=1000))
    user_created = fields.Str(required=True)
    #date_created = fields.DateTime(dump_only=True)

class MedicalHistoryUpdateRequest(Schema):
    hist_id = fields.Int(required=True, validate=validate.Range(min=1)) # ID es requerido para la actualización
    hist_primary_complaint = fields.Str(required=False, allow_none=True, validate=Length(min=1, max=1000))
    hist_onset_date = fields.Date(required=False, allow_none=True, format='%Y-%m-%d')
    hist_related_trauma = fields.Bool(required=False, allow_none=True)
    hist_current_treatment = fields.Str(required=False, allow_none=True, validate=Length(max=1000))
    hist_notes = fields.Str(required=False, allow_none=True, validate=Length(max=1000))
    user_modified = fields.Str(required=False, validate=Length(min=1, max=50))
    date_modified = fields.DateTime(required=False, format='%Y-%m-%d %H:%M:%S')

