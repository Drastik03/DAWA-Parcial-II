from marshmallow import Schema, fields
class NotificationIsReadRequest(Schema):
    notification_id = fields.Integer(required=True)
    notification_read = fields.Boolean(required=True)
