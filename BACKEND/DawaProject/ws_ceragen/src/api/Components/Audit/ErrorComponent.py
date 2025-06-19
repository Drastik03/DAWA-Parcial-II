import os
import re
from ....utils.general.logs import HandleLogs
from datetime import datetime


class ErrorComponent:
    @staticmethod
    def read_logs():
        path = os.path.abspath('src/utils/general')
        log_dir = os.path.join(path, "LOGS")
        logs = []
        HandleLogs.write_log('read logs')

        if os.path.exists(log_dir):
            HandleLogs.write_log('existe')
            for filename in os.listdir(log_dir):
                # Verificar si el archivo cumple con el patrón ERR_ o LOG_
                if (filename.startswith("ERR_") or filename.startswith("LOG_")) and filename.endswith(".log"):
                    # Extraer la fecha del nombre del archivo
                    date_str = ErrorComponent.extract_date_from_filename(filename)
                    if date_str:
                        # Convertir la fecha extraída en un objeto datetime
                        try:
                            date_obj = datetime.strptime(date_str, '%d_%m_%Y')
                            formatted_date = date_obj.strftime('%d-%m-%Y')
                        except ValueError:
                            HandleLogs.write_log(f'Error al parsear la fecha en el archivo: {filename}')
                            continue

                        with open(os.path.join(log_dir, filename), "r") as file:
                            for line in file:
                                parsed_line = ErrorComponent.parse_log_line(filename, line, formatted_date)
                                if parsed_line:
                                    logs.append(parsed_line)
        else:
            HandleLogs.write_log('No Existe :' + log_dir)

        return logs

    @staticmethod
    def extract_date_from_filename(filename):
        # Modificar la expresión regular para admitir ERR_ o LOG_
        match = re.search(r'(ERR|LOG)_(\d{2})_(\d{2})_(\d{4})\.log', filename)
        if match:
            _, day, month, year = match.groups()
            return f"{day}_{month}_{year}"
        return None

    @staticmethod
    def parse_log_line(filename, line, date):
        log_pattern = re.compile(r'(\d{2}:\d{2}:\d{2}) - (ERR|INF) - ([\w<>]+) - (.+)')
        match = log_pattern.match(line)
        if match:
            return {
                'filename': filename,
                'date': date,
                'time': match.group(1),
                'level': match.group(2),
                'function': match.group(3),
                'message': match.group(4),
                'id': f"{filename}_{match.group(1)}"
            }
        return None
