from marshmallow import Schema, fields, validate

class ClinicSessionInsertRequest(Schema):
    cli_person_id = fields.Int(required=True)
    cli_identification = fields.Str(required=True, validate=[validate.Length(min=10, max=13)])
    cli_name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    cli_address_bill = fields.Str(required=False, allow_none=True, validate=validate.Length(max=200))
    cli_mail_bill = fields.Email(required=False, allow_none=True, validate=validate.Length(max=100))
    user_created = fields.Str(required=True, validate=validate.Length(min=1))


class ClinicSessionUpdateRequest(Schema):
    cli_person_id = fields.Int(required=True)
    cli_identification = fields.Str(required=True, validate=[validate.Length(min=10, max=13)])
    cli_name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    cli_address_bill = fields.Str(required=False, allow_none=True, missing='', validate=validate.Length(max=200))
    cli_mail_bill = fields.Email(required=False, allow_none=True, missing='', validate=validate.Length(max=100))
    user_modified = fields.Str(required=True, validate=validate.Length(min=1))