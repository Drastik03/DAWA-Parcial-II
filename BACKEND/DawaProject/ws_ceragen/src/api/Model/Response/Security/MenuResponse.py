class MenuResponse:
    def __init__(self,menu_id, menu_name,menu_order,menu_icon_name,menu_url,menu_href,mod_name,rol_name,menu_key ):
        self.menu_id = menu_id
        self.menu_name = menu_name
        self.menu_order = menu_order
        self.menu_icon_name = menu_icon_name
        self.menu_href = menu_href
        self.menu_url = menu_url
        self.menu_key = menu_key
        self.mod_name = mod_name
        self.rol_name = rol_name

    def to_json(self):
        return {
            'Credentials': {
                'menu_id': self.menu_id,
                'menu_key': self.menu_key,
            },
            'GeneralData': {
                'menu_name': self.menu_name,
                'menu_order': self.menu_order,
                'menu_icon_name': self.menu_icon_name,
                'menu_href': self.menu_href,
                'menu_url': self.menu_url,
                'mod_name': self.mod_name,
                'rol_name': self.rol_name,

            },
        }