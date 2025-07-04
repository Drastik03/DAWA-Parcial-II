from marshmallow import Schema, fields
from ..ValidateDataRequest import ValidateDataRequestSchema

class PromotionCreateRequest(Schema):
    ppr_product_id = fields.Integer(required=True, validate=ValidateDataRequestSchema.validate_positive_integer)
    ppr_name = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
    ppr_description = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
    ppr_discount_percent = fields.Decimal(required=True, as_string=True)
    ppr_extra_sessions = fields.Integer(required=True, validate=ValidateDataRequestSchema.validate_positive_integer)
    ppr_start_date = fields.Date(required=True)
    ppr_end_date = fields.Date(required=True)
    user_created = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)

class PromotionUpdateRequest(Schema):
    ppr_id = fields.Integer(required=True, validate=ValidateDataRequestSchema.validate_positive_integer)
    ppr_product_id = fields.Integer(required=True, validate=ValidateDataRequestSchema.validate_positive_integer)
    ppr_name = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
    ppr_description = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
    ppr_discount_percent = fields.Decimal(required=True, as_string=True)
    ppr_extra_sessions = fields.Integer(required=True, validate=ValidateDataRequestSchema.validate_positive_integer)
    ppr_start_date = fields.Date(required=True)
    ppr_end_date = fields.Date(required=True)
    user_process = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
