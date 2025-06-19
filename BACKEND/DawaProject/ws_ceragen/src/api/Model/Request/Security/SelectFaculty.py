from marshmallow import Schema, fields

from ..ValidateDataRequest import ValidateDataRequestSchema


class SelectFacultySchema(Schema):
    id_unit = fields.Integer(required=True, validate=ValidateDataRequestSchema.validate_positive_integer)

