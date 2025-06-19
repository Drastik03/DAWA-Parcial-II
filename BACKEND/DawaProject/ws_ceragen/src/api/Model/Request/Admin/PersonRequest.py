from marshmallow import Schema, fields

class PersonInsertRequest(Schema):
    per_identification = fields.String(required=True)
    per_names = fields.String(required=True)
    per_surnames = fields.String(required=True)
    per_genre_id = fields.Int(required=True)
    per_marital_status_id = fields.Int(required=False)
    per_country = fields.String(required=False)
    per_city = fields.String(required=False)
    per_address = fields.String(required=False)
    per_phone = fields.String(required=False)
    per_mail = fields.String(required=True)
    user_process = fields.String(required=True)

class PersonUpdateRequest(Schema):
    per_id = fields.Int(required=True)
    per_identification = fields.String(required=True)
    per_names = fields.String(required=True)
    per_surnames = fields.String(required=True)
    per_genre_id = fields.Int(required=True)
    per_marital_status_id = fields.Int(required=False)
    per_country = fields.String(required=False)
    per_city = fields.String(required=False)
    per_address = fields.String(required=False)
    per_phone = fields.String(required=False)
    per_mail = fields.String(required=True)
    user_process = fields.String(required=True)