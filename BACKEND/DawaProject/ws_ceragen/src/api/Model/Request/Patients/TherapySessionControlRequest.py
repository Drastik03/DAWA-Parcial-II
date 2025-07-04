from marshmallow import Schema, fields, validate
from marshmallow.validate import Length


class TherapySessionControlInsertRequest(Schema):
    sec_inv_id = fields.Int(required=True, validate=validate.Range(min=1),
                            metadata={"description": "ID del inventario/paquete asociado a la sesión."})
    sec_pro_id = fields.Int(required=True, validate=validate.Range(min=1),
                            metadata={"description": "ID del profesional (terapeuta/médico) asociado a la sesión."})
    sec_ses_number = fields.Int(required=True, validate=validate.Range(min=1),
                                metadata={"description": "Número de la sesión (ej. 1 de 10)."})

    sec_ses_agend_date = fields.DateTime(required=False, allow_none=True, format='%Y-%m-%d %H:%M:%S',
                                         metadata={"description": "Fecha y hora agendada de la sesión."})
    sec_ses_exec_date = fields.DateTime(required=False, allow_none=True, format='%Y-%m-%d %H:%M:%S',
                                        metadata={"description": "Fecha y hora de ejecución real de la sesión."})

    sec_typ_id = fields.Int(required=True, validate=validate.Range(min=1),
                            metadata={"description": "ID del tipo de sesión (ej. Terapia Física, Quiropráctica)."})
    sec_med_staff_id = fields.Int(required=True, validate=validate.Range(min=1),
                                  metadata={"description": "ID del personal médico/staff que realiza la sesión."})

    ses_consumed = fields.Bool(required=False, metadata={"description": "Indica si la sesión ha sido consumida."})
    ses_state = fields.Bool(required=False, metadata={"description": "Estado activo/inactivo de la sesión."})

    user_created = fields.Str(required=True, validate=Length(min=1, max=50),
                              metadata={"description": "Usuario que crea el registro."})


class TherapySessionControlUpdateRequest(Schema):
    sec_inv_id = fields.Int(required=False, allow_none=True, validate=validate.Range(min=1),
                            metadata={"description": "ID del inventario/paquete asociado a la sesión."})
    sec_pro_id = fields.Int(required=False, allow_none=True, validate=validate.Range(min=1),
                            metadata={"description": "ID del profesional (terapeuta/médico) asociado a la sesión."})
    sec_ses_number = fields.Int(required=False, allow_none=True, validate=validate.Range(min=1),
                                metadata={"description": "Número de la sesión (ej. 1 de 10)."})

    sec_ses_agend_date = fields.DateTime(required=False, allow_none=True, format='%Y-%m-%d %H:%M:%S',
                                         metadata={"description": "Fecha y hora agendada de la sesión."})
    sec_ses_exec_date = fields.DateTime(required=False, allow_none=True, format='%Y-%m-%d %H:%M:%S',
                                        metadata={"description": "Fecha y hora de ejecución real de la sesión."})

    sec_typ_id = fields.Int(required=False, allow_none=True, validate=validate.Range(min=1),
                            metadata={"description": "ID del tipo de sesión (ej. Terapia Física, Quiropráctica)."})
    sec_med_staff_id = fields.Int(required=False, allow_none=True, validate=validate.Range(min=1),
                                  metadata={"description": "ID del personal médico/staff que realiza la sesión."})

    ses_consumed = fields.Bool(required=False, allow_none=True,
                               metadata={"description": "Indica si la sesión ha sido consumida."})
    ses_state = fields.Bool(required=False, allow_none=True,
                            metadata={"description": "Estado activo/inactivo de la sesión."})

    # user_modified será manejado por el servicio/componente desde el token.
    user_modified = fields.Str(required=False, allow_none=True, validate=Length(min=1, max=50),
                               metadata={"description": "Usuario que modifica el registro."})