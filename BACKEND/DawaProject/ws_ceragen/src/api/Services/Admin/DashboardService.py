from flask_restful import Resource

from ...Components.Admin.AdminDashboardComponent import AdminDashboardComponent
from ....utils.general.logs import HandleLogs
from flask import request
from ....utils.general.response import (
    response_success,
    response_not_found,
    response_error,
    response_unauthorize
)
from ...Components.Security.TokenComponent import TokenComponent

class DashboardService_GetAll(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Dashboard iniciado")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = AdminDashboardComponent.Dashboard()
            HandleLogs.write_log(res)
            print("DESDE RESPONSE SERVICE DASHBOARD",res)
            if res["data"].get("data"):
                return response_success(res)
            else:
                return response_not_found()

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))




