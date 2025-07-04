from marshmallow import Schema, fields
from ..ValidateDataRequest import ValidateDataRequestSchema
class InsertRolUserSchema(Schema):
    id_user = fields.Integer(required=True, validate=ValidateDataRequestSchema.validate_positive_integer)
    id_rol = fields.Integer(required=True, validate=ValidateDataRequestSchema.validate_positive_integer)
    id_career_period = fields.Integer(required=True, validate=ValidateDataRequestSchema.validate_positive_integer)
