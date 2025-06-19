from marshmallow import  Schema,fields
class UpdateModuloSchema(Schema):
     mod_id = fields.Integer(required=True)
     mod_name = fields.String(required=True)
     mod_description = fields.String(required=True)
     mod_order = fields.Integer(required=True)
     mod_icon_name = fields.String(required=True)
