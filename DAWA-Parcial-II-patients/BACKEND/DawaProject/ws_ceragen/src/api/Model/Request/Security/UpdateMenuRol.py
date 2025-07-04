from marshmallow import Schema, fields
class UpdateMenuRolSchema(Schema):
    registro_id = fields.Integer(required=True)
    menu_id = fields.Integer(required=True)
    rol_id = fields.Integer(required=True)