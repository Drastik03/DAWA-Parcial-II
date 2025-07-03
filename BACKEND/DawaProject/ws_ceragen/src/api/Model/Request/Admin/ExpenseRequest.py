from marshmallow import Schema, fields

from ..ValidateDataRequest import ValidateDataRequestSchema


class ExpenseCreateRequest(Schema):
    exp_type_id = fields.Int(required=True)
    exp_payment_method_id = fields.Int(required=True)
    exp_description = fields.Str(required=True)
    exp_date = fields.DateTime(required=True)
    exp_amount = fields.Decimal(required=True)
    exp_receipt_number = fields.Str(required=True)
    user_created = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
class ExpenseUpdateRequest(Schema):
    exp_id = fields.Int(required=True)
    exp_type_id = fields.Int(required=True)
    exp_payment_method_id = fields.Int(required=True)
    exp_description = fields.Str(required=True)
    exp_date = fields.DateTime(required=True)
    exp_amount = fields.Decimal(required=True)
    exp_receipt_number = fields.Str(required=True)
    user_created = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)