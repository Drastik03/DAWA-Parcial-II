from marshmallow import Schema, fields
class ParameterListInsertRequest(Schema):
    pli_code_parameter = fields.String(required=True)
    pli_string_value_return = fields.String(required=True)
    pli_numeric_value_return = fields.Integer(required=True)
    user_process = fields.String(required=True)

class ParameterListUpdateRequest(Schema):
    pli_id = fields.Int(required=True)
    pli_code_parameter = fields.String(required=True)
    pli_string_value_return = fields.String(required=True)
    pli_numeric_value_return = fields.Integer(required=True)
    user_process = fields.String(required=True)