from marshmallow import Schema, fields

from ..ValidateDataRequest import ValidateDataRequestSchema


class MedicPersonTypeCreateRequest(Schema):
    mpt_name = fields.Str(required=True)
    mpt_description = fields.Str(required=True)
    user_created = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
class MedicPersonTypeUpdateRequest(Schema):
    mpt_id = fields.Int(required=True)
    mpt_name = fields.Str(required=True)
    mpt_description = fields.Str(required=True)
    user_created = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)