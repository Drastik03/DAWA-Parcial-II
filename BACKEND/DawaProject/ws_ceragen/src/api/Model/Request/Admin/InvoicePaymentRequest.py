from marshmallow import Schema, fields
from ..ValidateDataRequest import ValidateDataRequestSchema

class InvoicePaymentCreateRequest(Schema):
    inp_invoice_id = fields.Int(required=True)
    inp_payment_method_id = fields.Int(required=True)
    inp_amount = fields.Decimal(required=True)
    inp_proof_image_path = fields.String(allow_none=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
    user_created = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)

class InvoicePaymentUpdateRequest(Schema):
    inp_id = fields.Int(required=True)
    inp_invoice_id = fields.Int(required=True)
    inp_payment_method_id = fields.Int(required=True)
    inp_amount = fields.Decimal(required=True)
    inp_proof_image_path = fields.String(allow_none=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
    user_modified = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
