from marshmallow import Schema, fields
class InsertMenuRolSchema(Schema):
    menu_id = fields.Integer(required=True)
    rol_id = fields.Integer(required=True)
