from marshmallow import Schema, fields, validate

class InvoiceTaxCreateRequest(Schema):
    int_invoice_id = fields.Int(required=True, error_messages={"required": "El ID de la factura es obligatorio"})
    int_tax_id = fields.Int(required=True, error_messages={"required": "El ID del impuesto es obligatorio"})
    int_tax_amount = fields.Decimal(required=True, as_string=True, error_messages={"required": "El monto del impuesto es obligatorio"})
    user_created = fields.Str(required=True, validate=validate.Length(min=1), error_messages={"required": "El usuario creador es obligatorio"})

class InvoiceTaxUpdateRequest(Schema):
    int_id = fields.Int(required=True, error_messages={"required": "El ID del registro es obligatorio"})
    int_invoice_id = fields.Int(required=True, error_messages={"required": "El ID de la factura es obligatorio"})
    int_tax_id = fields.Int(required=True, error_messages={"required": "El ID del impuesto es obligatorio"})
    int_tax_amount = fields.Decimal(required=True, as_string=True, error_messages={"required": "El monto del impuesto es obligatorio"})
    user_modified = fields.Str(required=True, validate=validate.Length(min=1), error_messages={"required": "El usuario modificador es obligatorio"})
