from marshmallow import Schema, fields
class DeleteServiceSchema(Schema):
    del_id = fields.Integer(required=True)

