from marshmallow import Schema, fields
from ..ValidateDataRequest import ValidateDataRequestSchema


class UpdateUserPasswordSchema(Schema):
    oldPassword = fields.String(required=True)
    newPassword = fields.String(required=True)
    user_id = fields.Integer(required=True)
