from marshmallow import Schema, fields

class MaritalStatusInsertRequest(Schema):
    status_name = fields.String(required=True)
    user_process = fields.String(required=True)

class MaritalStatusUpdateRequest(Schema):
    id = fields.Int(required=True)
    status_name = fields.String(required=True)
    user_process = fields.String(required=True)