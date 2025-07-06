from flask import jsonify

from ....utils.common.convert_float import convert_decimal_to_float
from ....utils.database.connection_db import DataBaseHandle
from datetime import datetime
from ....utils.general.logs import HandleLogs
from ....utils.general.response import internal_response

class AdminDashboardComponent:
    @staticmethod
    def Dashboard():
        try:
            query = """
                SELECT * FROM ceragen.sp_get_dashboard_admin();
            """
            data = DataBaseHandle.getRecords(query, 0)
            res = convert_decimal_to_float(data)
            return internal_response(True, "Dashboard obtenido correctamente.", resg)
        except Exception as err:
            HandleLogs.write_error(err)
            return internal_response(False, f"Error al obtener el dashboard de pago: {err}", [])


