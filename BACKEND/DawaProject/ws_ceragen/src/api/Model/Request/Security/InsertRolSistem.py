from marshmallow import Schema,fields
class InsertRolSistemSchema(Schema):
    rol_name = fields.String(required=True)
    rol_description = fields.String(required=True)