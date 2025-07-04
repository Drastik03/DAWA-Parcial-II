from marshmallow import Schema, fields

from ..ValidateDataRequest import ValidateDataRequestSchema


class InvoiceCreateRequest(Schema):
    inv_date = fields.DateTime(required=True)
    inv_client_id = fields.Int(required=True)
    inv_patient_id = fields.Int(required=True)
    inv_subtotal = fields.Decimal(required=True)
    inv_discount = fields.Decimal(required=True)
    inv_tax = fields.Decimal(required=True)
    user_created = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)

class InvoiceUpdateRequest(Schema):
    inv_id = fields.Int(required=True)
    inv_date = fields.DateTime(required=True)
    inv_client_id = fields.Int(required=True)
    inv_patient_id = fields.Int(required=True)
    inv_subtotal = fields.Decimal(required=True)
    inv_discount = fields.Decimal(required=True)
    inv_tax = fields.Decimal(required=True)
    user_created = fields.String(required=True, validate=ValidateDataRequestSchema.validate_string_not_empty)
