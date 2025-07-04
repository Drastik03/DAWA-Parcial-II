from marshmallow import Schema, fields

class MedicalHistoryResponse(Schema):
    hist_id = fields.Integer(dump_only=True)
    hist_patient_id = fields.Integer()
    hist_primary_complaint = fields.String(allow_none=True)
    hist_onset_date = fields.Date(format="%d/%m/%Y", allow_none=True) # Formato de salida DD/MM/YYYY
    hist_related_trauma = fields.Boolean(allow_none=True)
    hist_current_treatment = fields.String(allow_none=True)
    hist_notes = fields.String(allow_none=True)
    user_created = fields.String()
    date_created = fields.DateTime(format="%d/%m/%Y %H:%M:%S")
    user_modified = fields.String(allow_none=True)
    date_modified = fields.DateTime(format="%d/%m/%Y %H:%M:%S", allow_none=True)
    user_deleted = fields.String(allow_none=True)
    date_deleted = fields.DateTime(format="%d/%m/%Y %H:%M:%S", allow_none=True)