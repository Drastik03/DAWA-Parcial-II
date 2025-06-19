from marshmallow import fields,Schema
from ..ValidateDataRequest import ValidateDataRequestSchema

class UpdateurcpSchema(Schema):
    urcp_id = fields.Integer(required=True,validate=ValidateDataRequestSchema.validate_positive_integer)
    cp_id = fields.Integer(required=True,validate=ValidateDataRequestSchema.validate_positive_integer)
