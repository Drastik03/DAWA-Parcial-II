from marshmallow import Schema, fields

from ..ValidateDataRequest import ValidateDataRequestSchema


class ClientCreateRequest(Schema):
    cli_person_id = fields.Int(required=True)
    cli_identification = fields.Str(required=True,validate=ValidateDataRequestSchema.validate_string_not_empty)
    cli_name = fields.Str(required=True,validate=ValidateDataRequestSchema.validate_string_not_empty)
    cli_address_bill = fields.Str(required=False,validate=ValidateDataRequestSchema.validate_string_not_empty)
    cli_mail_bill = fields.Str(required=True,validate=ValidateDataRequestSchema.validate_string_not_empty)
    user_created = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)

class ClientUpdateRequest(Schema):
    cli_id = fields.Int(required=True)
    cli_person_id = fields.Int(required=True)
    cli_identification = fields.Str(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
    cli_name = fields.Str(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
    cli_address_bill = fields.Str(required=False, validate=ValidateDataRequestSchema.validate_string_not_empty)
    cli_mail_bill = fields.Str(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
    user_modified = fields.Str(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
