from marshmallow import Schema,fields
from ..ValidateDataRequest import ValidateDataRequestSchema
class InsertUserSchema(Schema):
    person_id = fields.Integer(required=True)#, validate=ValidateDataRequestSchema.validate_positive_integer)
    person_ci = fields.String(required=True)#, validate=ValidateDataRequestSchema.validate_person_ci)
    person_mail = fields.String(required=True)#, validate=ValidateDataRequestSchema.validate_string_not_empty)
    person_password = fields.String(required=True)#, validate=ValidateDataRequestSchema.validate_string_not_empty)
    rol_id = fields.Integer(required=True)
    id_career_period = fields.Integer(required=True)#, validate=ValidateDataRequestSchema.validate_positive_integer)
