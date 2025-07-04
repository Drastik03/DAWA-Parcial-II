from marshmallow import Schema, fields, validate
from marshmallow.validate import Length

class ClinicBloodInsertRequest(Schema):
    btp_id = fields.Int(required=False)  # Autogenerado, no requerido al insertar
    btp_type = fields.Str(required=True, validate=Length(min=1, max=3))
    btp_description = fields.Str(required=False, allow_none=True, validate=Length(max=1000))
    btp_state = fields.Bool(required=False)  # default en DB es True
    user_created = fields.Str(required=True, validate=Length(min=1, max=100))
    date_created = fields.DateTime(required=True, format='%Y-%m-%d %H:%M:%S')

class ClinicBloodUpdateRequest(Schema):
    btp_id = fields.Int(required=True)  # Requerido para la actualización
    btp_type = fields.Str(required=False, allow_none=True, validate=Length(min=1, max=3))
    btp_description = fields.Str(required=False, allow_none=True, validate=Length(max=1000))
    user_modified = fields.Str(required=True, validate=Length(min=1, max=100))
    date_modified = fields.DateTime(required=True, format='%Y-%m-%d %H:%M:%S')