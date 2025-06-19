from marshmallow import Schema, fields
from ..ValidateDataRequest import ValidateDataRequestSchema

class InserturcpSchema(Schema):
    ur_id = fields.Integer(required=True,validate=ValidateDataRequestSchema.validate_positive_integer)
    cp_id = fields.Integer(required=True,validate=ValidateDataRequestSchema.validate_positive_integer)
