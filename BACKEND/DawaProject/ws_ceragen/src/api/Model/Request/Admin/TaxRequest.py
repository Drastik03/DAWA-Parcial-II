from marshmallow import Schema, fields, validate

class TaxCreateRequest(Schema):
    tax_name = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    tax_percentage = fields.Float(required=True)
    tax_description = fields.Str(required=False)

class TaxUpdateRequest(Schema):
    tax_id = fields.Int(required=True)
    tax_name = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    tax_percentage = fields.Float(required=True)
    tax_description = fields.Str(required=False)
