from marshmallow import Schema, fields

from ..ValidateDataRequest import ValidateDataRequestSchema


class TherapyTypeCreateRequest(Schema):
    tht_name = fields.Str(required=True)
    tht_description = fields.Str(required=True)
    user_created = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
class TherapyTypeUpdateRequest(Schema):
    tht_id = fields.Int(required=True)
    tht_name = fields.Str(required=True)
    tht_description = fields.Str(required=True)
    user_created = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)