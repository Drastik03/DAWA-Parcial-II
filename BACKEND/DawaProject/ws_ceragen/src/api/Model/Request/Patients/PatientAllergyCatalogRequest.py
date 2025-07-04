from marshmallow import Schema, fields

class AllergyCatalogInsertRequest(Schema):
    al_name = fields.Str(required=True)
    al_description = fields.Str(required=False, allow_none=True)
    al_state = fields.Bool(missing=True)
    user_created = fields.Str(required=True)

class AllergyCatalogUpdateRequest(Schema):
    al_name = fields.Str(required=True)
    al_description = fields.Str(required=False, allow_none=True)
    al_state = fields.Bool(required=True)
    user_modified = fields.Str(required=True)
