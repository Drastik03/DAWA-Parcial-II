from marshmallow import Schema, fields

class TherapySessionControlResponse(Schema):
    sec_id = fields.Integer(dump_only=True, metadata={"description": "ID único de la sesión de control."})
    sec_inv_id = fields.Integer(metadata={"description": "ID del inventario/paquete asociado."})
    sec_pro_id = fields.Integer(metadata={"description": "ID del profesional asociado."})
    sec_ses_number = fields.Integer(metadata={"description": "Número de la sesión."})

    # CORRECCIÓN: Cambiados de fields.DateTime a fields.String
    sec_ses_agend_date = fields.String(allow_none=True,
                                         metadata={"description": "Fecha y hora agendada de la sesión (DD/MM/YYYY HH24:MI:SS)."})
    sec_ses_exec_date = fields.String(allow_none=True,
                                        metadata={"description": "Fecha y hora de ejecución real de la sesión (DD/MM/YYYY HH24:MI:SS)."})

    sec_typ_id = fields.Integer(metadata={"description": "ID del tipo de sesión."})
    sec_med_staff_id = fields.Integer(metadata={"description": "ID del personal médico/staff."})

    ses_consumed = fields.Boolean(metadata={"description": "Estado de consumo de la sesión."})
    ses_state = fields.Boolean(metadata={"description": "Estado activo/inactivo del registro de sesión."})

    user_created = fields.String(metadata={"description": "Usuario que creó el registro."})
    # CORRECCIÓN: Cambiado de fields.DateTime a fields.String
    date_created = fields.String(metadata={"description": "Fecha de creación del registro (DD/MM/YYYY HH24:MI:SS)."})
    user_modified = fields.String(allow_none=True, metadata={"description": "Usuario que modificó el registro."})
    # CORRECCIÓN: Cambiado de fields.DateTime a fields.String
    date_modified = fields.String(allow_none=True,
                                    metadata={"description": "Fecha de última modificación (DD/MM/YYYY HH24:MI:SS)."})
    user_deleted = fields.String(allow_none=True,
                                 metadata={"description": "Usuario que eliminó lógicamente el registro."})
    # CORRECCIÓN: Cambiado de fields.DateTime a fields.String
    date_deleted = fields.String(allow_none=True,
                                   metadata={"description": "Fecha de eliminación lógica (DD/MM/YYYY HH24:MI:SS)."})
