from marshmallow import Schema, fields
class UpdateUserRolSchema(Schema):
    id_user_rol= fields.Integer(required=True)
    id_user = fields.Integer(required=True)
    id_rol = fields.Integer( required=True)