from marshmallow import Schema, fields

class DiseaseCatalogInsertRequest(Schema):
    dis_name = fields.Str(required=True)
    dis_description = fields.Str(required=False, allow_none=True)
    dis_type_id = fields.Int(required=True)
    dis_state = fields.Bool(required=False, missing=True)
    user_created = fields.Str(required=True)

class DiseaseCatalogUpdateRequest(Schema):
    dis_name = fields.Str(required=True)
    dis_description = fields.Str(required=False, allow_none=True)
    dis_type_id = fields.Int(required=True)
    dis_state = fields.Bool(required=False, missing=True)
    user_modified = fields.Str(required=True)