from marshmallow import  Schema,fields
class UpdateMenuSchema(Schema):
    menu_id = fields.Integer(required=True)
    menu_name = fields.String(required=True)
    menu_order = fields.Integer(required=True)
    menu_module_id = fields.Integer(required=True)
    menu_parent_id = fields.Integer(required=False)
    menu_icon_name = fields.String(required=True)
    menu_href = fields.String(required=True)
    menu_url = fields.String(required=True)