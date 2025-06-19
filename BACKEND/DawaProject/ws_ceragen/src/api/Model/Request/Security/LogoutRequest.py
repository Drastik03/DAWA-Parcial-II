from marshmallow import Schema, fields
class LogoutRequestSchema(Schema):
    logId = fields.Integer(required=True)