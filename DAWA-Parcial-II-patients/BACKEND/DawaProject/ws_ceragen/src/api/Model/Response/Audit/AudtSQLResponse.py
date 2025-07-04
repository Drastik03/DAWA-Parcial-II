from datetime import datetime
import json
class AuditSQLResponse:
    def __init__(self, ser_id, table_name, sql_command, new_record, old_record, user_name, date_event):
        self.ser_id = ser_id
        self.table_name = table_name
        self.sql_command = sql_command
        self.new_record = json.loads(new_record) if isinstance(new_record, str) else new_record
        self.old_record = json.loads(old_record) if isinstance(old_record, str) else old_record
        self.user_name = user_name
        self.date_event = date_event


    def to_json(self):
        return {
            'id': self.ser_id,
            'table_name': self.table_name,
            'sql_command': self.sql_command,
            'new_record': self.new_record,
            'old_record': self.old_record,
            'user_name': self.user_name,
            'date_event': self.date_event.isoformat() if isinstance(self.date_event, datetime) else self.date_event

        }

