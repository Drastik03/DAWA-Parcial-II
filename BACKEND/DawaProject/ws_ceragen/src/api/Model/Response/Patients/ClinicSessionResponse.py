from marshmallow import Schema, fields

class ClinicSessionResponse(Schema):
    cli_id = fields.Integer(dump_only=True)
    cli_person_id = fields.Integer()
    cli_identification = fields.String()
    cli_name = fields.String()
    cli_address_bill = fields.String()
    cli_mail_bill = fields.String()
    cli_state = fields.Boolean()

    user_created = fields.String()
    date_created = fields.DateTime(format="%d/%m/%Y %H:%M:%S")
    user_modified = fields.String()
    date_modified = fields.DateTime(format="%d/%m/%Y %H:%M:%S")
    user_deleted = fields.String()
    date_deleted = fields.DateTime(format="%d/%m/%Y %H:%M:%S")

    # Campos extendidos desde la tabla relacionada con persona
    per_first_name = fields.String()
    per_last_name = fields.String()
    per_identification_number = fields.String()
    per_birth_date = fields.Date(format="%d/%m/%Y")
    per_gender = fields.String()
    per_email = fields.String()
    per_phone_number = fields.String()
    per_address = fields.String()