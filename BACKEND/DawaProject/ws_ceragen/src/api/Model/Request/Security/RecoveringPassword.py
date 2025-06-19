from marshmallow import Schema, fields


class RecoveringPasswordSchema(Schema):
    user_mail = fields.String(required=True)
class UpdatePasswordSchema(Schema):
    user_id = fields.String(required=True)
    new_password = fields.String(required=True)
    token_temp = fields.String(required=True)