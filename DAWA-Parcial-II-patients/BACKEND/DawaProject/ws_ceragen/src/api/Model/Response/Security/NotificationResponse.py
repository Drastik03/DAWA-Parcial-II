from datetime import datetime
class NotificationResponse:
    def __init__(self,
                 sun_id,
                 sun_title_notification,
                 sun_text_notification,
                 sun_isread_notification,
                 sun_date_notification,
                 recipient_login_id,
                 sender_login_id
                 ):
        self.sun_id = sun_id
        self.sun_title_notification = sun_title_notification
        self.sun_text_notification = sun_text_notification
        self.sun_isread_notification = sun_isread_notification
        self.sun_date_notification = sun_date_notification
        self.recipient_login_id = recipient_login_id
        self.sender_login_id = sender_login_id



    def to_json(self):
        return {
            "sun_id": self.sun_id,
            "sun_title_notification": self.sun_title_notification,
            "sun_text_notification": self.sun_text_notification,
            "sun_isread_notification": self.sun_isread_notification,
            "sun_date_notification": self.sun_date_notification.isoformat() if isinstance(self.sun_date_notification, datetime) else self.sun_date_notification,
            "recipient_login_id": self.recipient_login_id,
            "sender_login_id": self.sender_login_id

        }