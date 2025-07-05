from marshmallow import Schema, fields, validate
from marshmallow.validate import Length

class MedicalStaffInsertRequest(Schema):
    """
    Esquema para la validación de los datos al crear un nuevo registro de personal médico.
    """
    med_person_id = fields.Int(required=True, validate=validate.Range(min=1),
                               metadata={"description": "ID de la persona asociada al personal médico."})
    med_type_id = fields.Int(required=True, validate=validate.Range(min=1),
                             metadata={"description": "ID del tipo de personal médico (ej. Doctor, Enfermero)."})

    med_registration_number = fields.Str(required=False, allow_none=True, validate=Length(min=1, max=100),
                                         metadata={
                                             "description": "Número de registro profesional del personal médico."})
    med_specialty = fields.Str(required=False, allow_none=True, validate=Length(min=1, max=100),
                               metadata={"description": "Especialidad del personal médico."})

    med_state = fields.Bool(required=False, load_default=True,
                            metadata={"description": "Estado activo/inactivo del personal médico. Por defecto: true."})

    user_created = fields.Str(required=True, validate=Length(min=1, max=50),
                              metadata={"description": "Usuario que crea el registro."})

class MedicalStaffUpdateRequest(Schema):
    """
    Esquema para la validación de los datos al actualizar parcialmente un registro de personal médico.
    """
    med_person_id = fields.Int(required=False, allow_none=True, validate=validate.Range(min=1),
                               metadata={"description": "ID de la persona asociada al personal médico."})
    med_type_id = fields.Int(required=False, allow_none=True, validate=validate.Range(min=1),
                             metadata={"description": "ID del tipo de personal médico (ej. Doctor, Enfermero)."})

    med_registration_number = fields.Str(required=False, allow_none=True, validate=Length(min=1, max=100),
                                         metadata={
                                             "description": "Número de registro profesional del personal médico."})
    med_specialty = fields.Str(required=False, allow_none=True, validate=Length(min=1, max=100),
                               metadata={"description": "Especialidad del personal médico."})

    med_state = fields.Bool(required=False, allow_none=True,
                            metadata={"description": "Estado activo/inactivo del personal médico."})

    user_modified = fields.Str(required=True, validate=Length(min=1, max=50),  # Obligatorio para la auditoría de update
                               metadata={"description": "Usuario que modifica el registro."})


class MedicalStaffDeleteRequest(Schema):
    """
    Esquema para la validación de los datos al eliminar (inactivar) lógicamente un registro de personal médico.
    """
    user_deleted = fields.Str(required=True, validate=Length(min=1, max=50),
                              metadata={"description": "Usuario que realiza la eliminación lógica."})


class MedicalStaffResponse(Schema):
    """
    Esquema para la serialización de un registro individual de personal médico
    """
    med_id = fields.Int(required=True, metadata={"description": "ID único del personal médico."})
    med_person_id = fields.Int(required=True, metadata={"description": "ID de la persona asociada."})
    med_type_id = fields.Int(required=True, metadata={"description": "ID del tipo de personal médico."})

    med_registration_number = fields.Str(metadata={"description": "Número de registro profesional."})
    med_specialty = fields.Str(metadata={"description": "Especialidad del personal médico."})

    med_state = fields.Bool(metadata={"description": "Estado activo/inactivo."})

    user_created = fields.Str(metadata={"description": "Usuario que creó el registro."})
    date_created = fields.DateTime(format='%Y-%m-%d %H:%M:%S', metadata={"description": "Fecha de creación."})

    user_modified = fields.Str(metadata={"description": "Último usuario que modificó el registro."})
    date_modified = fields.DateTime(format='%Y-%m-%d %H:%M:%S',
                                    metadata={"description": "Fecha de última modificación."})

    user_deleted = fields.Str(metadata={"description": "Usuario que eliminó (inactivó) el registro."})
    date_deleted = fields.DateTime(format='%Y-%m-%d %H:%M:%S',
                                   metadata={"description": "Fecha de eliminación (inactivación)."})


class MedicalStaffListResponse(Schema):
    """
    Esquema para la serialización de una lista de registros de personal médico.
    """
    data = fields.List(fields.Nested(MedicalStaffResponse), required=True,
                       metadata={"description": "Lista de registros de personal médico."})
    message = fields.Str(metadata={"description": "Mensaje de la respuesta."})
    result = fields.Bool(metadata={"description": "Estado del resultado de la operación."})
