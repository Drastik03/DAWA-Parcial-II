from marshmallow import Schema, fields

class PersonGenreInsertRequest(Schema):
    genre_name = fields.String(required=True)
    user_process = fields.String(required=True)

class PersonGenreUpdateRequest(Schema):
    id = fields.Int(required=True)
    genre_name = fields.String(required=True)
    user_process = fields.String(required=True)