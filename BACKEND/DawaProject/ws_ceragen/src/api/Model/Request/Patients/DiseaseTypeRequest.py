from marshmallow import Schema, fields

class DiseaseTypeInsertRequest(Schema):
    dst_name = fields.Str(required=True)
    dst_description = fields.Str(required=False, allow_none=True)
    dst_state = fields.Bool(required=False, missing=True)
    user_created = fields.Str(required=True)

class DiseaseTypeUpdateRequest(Schema):
    dst_name = fields.Str(required=True)
    dst_description = fields.Str(required=False, allow_none=True)
    dst_state = fields.Bool(required=False, missing=True)
    user_modified = fields.Str(required=True)