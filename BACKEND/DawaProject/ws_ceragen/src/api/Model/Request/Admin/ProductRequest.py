from marshmallow import Schema, fields
from ..ValidateDataRequest import ValidateDataRequestSchema

class AdminProductSchema(Schema):
    pro_code = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
    pro_name = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
    pro_description = fields.String(allow_none=True)
    pro_price = fields.Decimal(required=True, as_string=True)
    pro_total_sessions = fields.Integer(required=True, validate=ValidateDataRequestSchema.validate_positive_integer)
    pro_duration_days = fields.Integer(allow_none=True)
    pro_image_url = fields.String(allow_none=True)
    pro_therapy_type_id = fields.Integer(required=True, validate=ValidateDataRequestSchema.validate_positive_integer)
    user_created = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)


class ProductUpdateRequest(Schema):
    pro_id = fields.Integer(required=True, validate=ValidateDataRequestSchema.validate_positive_integer)
    pro_code = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
    pro_name = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
    pro_description = fields.String(allow_none=True)
    pro_price = fields.Decimal(required=True, as_string=True)
    pro_total_sessions = fields.Integer(required=True, validate=ValidateDataRequestSchema.validate_positive_integer)
    pro_duration_days = fields.Integer(allow_none=True)
    pro_image_url = fields.String(allow_none=True)
    pro_therapy_type_id = fields.Integer(required=True, validate=ValidateDataRequestSchema.validate_positive_integer)
    user_process = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)