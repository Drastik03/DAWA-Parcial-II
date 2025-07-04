from flask_restful import Resource
from ...Components.Patients.ClinicBloodComponent import ClinicBloodTypeComponent
from ....utils.general.logs import HandleLogs
from flask import request
from ....utils.general.response import (
    response_success,
    response_not_found,
    response_error,
    response_unauthorize
)
from ...Model.Request.Patients.ClinicBloodRequest import ClinicBloodInsertRequest, ClinicBloodUpdateRequest
from ...Components.Security.TokenComponent import TokenComponent

class ClinicBloodService_GetAll(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Listado de tipos de sangre")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = ClinicBloodTypeComponent.getAllBloodTypes()
            return response_success(res) if res else response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class ClinicBloodService_GetById(Resource):
    @staticmethod
    def get(btp_id):
        try:
            HandleLogs.write_log(f"Obtener tipo de sangre por ID: {btp_id}")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = ClinicBloodTypeComponent.getBloodTypeById(btp_id)
            return response_success(res) if res else response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class ClinicBloodService_Add(Resource):
    @staticmethod
    def post():
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.get_json()
            if not data:
                return response_error("Error en los datos para procesar")

            user = TokenComponent.User(token)
            data['user_created'] = user

            schema = ClinicBloodInsertRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Error al validar el request -> " + str(errors))
                return response_error("Error al validar el request -> " + str(errors))

            result = ClinicBloodTypeComponent.createBloodType(data)
            if result['result']:
                return response_success("Id de Registro -> " + str(result['data']['btp_id']))
            return response_error(result['message'])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class ClinicBloodService_Update(Resource):
    @staticmethod
    def patch():
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.get_json()
            if not data:
                return response_error("Error en los datos para procesar")

            schema = ClinicBloodUpdateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Error al validar el request -> " + str(errors))
                return response_error("Error al validar el request -> " + str(errors))

            btp_id = data.get('btp_id')
            result = ClinicBloodTypeComponent.updateBloodType(btp_id, data)
            return response_success(data) if result['result'] else response_error(result['message'])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class ClinicBloodService_Delete(Resource):
    @staticmethod
    def delete(btp_id):
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            user = TokenComponent.User(token)  # obtiene el usuario que elimina
            result = ClinicBloodTypeComponent.deleteBloodType(btp_id, user)
            return result
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))
