from marshmallow import Schema,fields
class UpdateRolSistemSchema(Schema):
    rol_id = fields.Integer(required=True)
    rol_name = fields.String(required=True)
    rol_description = fields.String(required=True)