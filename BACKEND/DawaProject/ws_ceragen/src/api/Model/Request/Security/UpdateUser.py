from marshmallow import Schema,fields
class UpdateUserSchema(Schema):
    id_user = fields.Integer(required=True)
