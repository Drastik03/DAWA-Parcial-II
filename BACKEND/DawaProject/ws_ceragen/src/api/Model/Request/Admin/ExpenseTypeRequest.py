from marshmallow import Schema, fields

from ..ValidateDataRequest import ValidateDataRequestSchema


class ExpenseTypeCreateRequest(Schema):
    ext_name = fields.Str(required=True)
    ext_description = fields.Str(required=True)
    user_created = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
class ExpenseTypeUpdateRequest(Schema):
    ext_id = fields.Int(required=True)
    ext_name = fields.Str(required=True)
    ext_description = fields.Str(required=True)
    user_created = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)