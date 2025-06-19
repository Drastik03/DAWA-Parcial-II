
class UserRolResponse:
    def __init__(self, id_user_rol, rol_name, menu_name, ):
        self.id_user_rol = id_user_rol
        self.rol_name = rol_name
        self.menu_name = menu_name


    def to_json(self):
        return {
            'Credentials': {
                'id': self.id_user_rol,
            },
            'GeneralData': {
                'rol_name': self.rol_name,
                'menu_name': self.menu_name,
            },
        }



