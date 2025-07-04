from datetime import datetime

class PersonResponse:
    def __init__(self,per_id,
    per_identification,
    per_names,
    per_surnames,
    per_mail,
    has_user,
    user_id,
    user_login_id,
    user_locked,
    user_state,
    user_last_login):
        self.per_id = per_id
        self.per_identification = per_identification
        self.per_names = per_names
        self.per_surnames = per_surnames
        self.per_mail = per_mail
        self.has_user = has_user
        self.user_id = user_id
        self.user_login_id = user_login_id
        self.user_locked = user_locked
        self.user_state = user_state
        self.user_last_login = user_last_login


    def to_json(self):
        return {
            "IdPerson": self.per_id,
            "Identification": self.per_identification,
            "Names": self.per_names,
            "Surnames": self.per_surnames,
            "Mail": self.per_mail,
            "IsUser": self.has_user,
            "IdUser": self.user_id,
            "LoginId": self.user_login_id,
            "Locked": self.user_locked,
            "State": self.user_state,
            "LastLogin": self.user_last_login.isoformat() if isinstance(self.user_last_login, datetime) else self.user_last_login
            }

