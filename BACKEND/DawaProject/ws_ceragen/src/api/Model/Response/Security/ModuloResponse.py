import uuid


class ModuloResponse:
    def __init__(self, mod_id, mod_name, mod_description, mod_order, mod_icon_name, mod_text_name):
        self.mod_id = mod_id
        self.mod_name = mod_name
        self.mod_description = mod_description
        self.mod_order = mod_order
        self.mod_icon_name = mod_icon_name
        self.mod_text_name = mod_text_name


    def to_json(self):
        return {
            'GeneralData': {
                'Mod_ID': self.mod_id,
                'Mod_Name': self.mod_name,
                'Mod_Description': self.mod_description,
                'Mod_Order': self.mod_order,
                'Mod_Icon_Name': self.mod_icon_name,
                'Mod_Text_Name': self.mod_text_name

            }
        }