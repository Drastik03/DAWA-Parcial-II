
class RolSistemResponse:
    def __init__(self, rol_id, rol_name, rol_description):
        self.rol_id = rol_id
        self.rol_name = rol_name
        self.rol_description = rol_description





    def to_json(self):
        return {
            'Credentials': {
                'rol_id': self.rol_id,
            },
            'GeneralData': {
                'rol_name': self.rol_name,
                'rol_description': self.rol_description,
            },
        }

