from marshmallow import Schema, fields

from ..ValidateDataRequest import ValidateDataRequestSchema


class PaymentMethodCreateRequest(Schema):
    pme_name = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
    pme_description = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
    pme_require_references = fields.Boolean(required=True)
    pme_require_picture_proff = fields.Boolean(required=True)
    user_created = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)

class PaymentMethodUpdateRequest(Schema):
    pme_id = fields.Integer(required=True, validate=ValidateDataRequestSchema.validate_positive_integer)
    pme_name = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
    pme_description = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
    pme_require_references = fields.Boolean(required=True)
    pme_require_picture_proff = fields.Boolean(required=True)
    user_created = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)