from marshmallow import Schema, fields, validate

class InvoiceDetailCreateRequest(Schema):
    ind_invoice_id = fields.Int(required=True, error_messages={"required": "El campo 'ind_invoice_id' es obligatorio."})
    ind_product_id = fields.Int(required=True, error_messages={"required": "El campo 'ind_product_id' es obligatorio."})
    ind_quantity = fields.Int(required=True, validate=validate.Range(min=1), error_messages={"required": "El campo 'ind_quantity' es obligatorio."})
    ind_unit_price = fields.Float(required=True, error_messages={"required": "El campo 'ind_unit_price' es obligatorio."})
    ind_total = fields.Float(required=True, error_messages={"required": "El campo 'ind_total' es obligatorio."})


class InvoiceDetailUpdateRequest(Schema):
    ind_id = fields.Int(required=True, error_messages={"required": "El campo 'ind_id' es obligatorio."})
    ind_invoice_id = fields.Int(required=True, error_messages={"required": "El campo 'ind_invoice_id' es obligatorio."})
    ind_product_id = fields.Int(required=True, error_messages={"required": "El campo 'ind_product_id' es obligatorio."})
    ind_quantity = fields.Int(required=True, validate=validate.Range(min=1), error_messages={"required": "El campo 'ind_quantity' es obligatorio."})
    ind_unit_price = fields.Float(required=True, error_messages={"required": "El campo 'ind_unit_price' es obligatorio."})
    ind_total = fields.Float(required=True, error_messages={"required": "El campo 'ind_total' es obligatorio."})
