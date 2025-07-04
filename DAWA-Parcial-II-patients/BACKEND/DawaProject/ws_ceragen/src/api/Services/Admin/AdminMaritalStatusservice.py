import json
from flask_restful import Resource
from ...Components.Admin.AdminMaritalStatus import MaritalStatuscomponent
from ....utils.general.logs import HandleLogs
from flask import jsonify, request
from ....utils.general.response import response_success, response_not_found, response_error, response_unauthorize
from ...Model.Request.Admin.MaritalStatusRequest import MaritalStatusInsertRequest, MaritalStatusUpdateRequest
from ...Components.Security.TokenComponent import TokenComponent

class MaritalStatus_get(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Listado de Estado Marital")
            token = request.headers['tokenapp']
            if token is None:
                return response_error("Error: No se ha podido Obtener el Token")
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()
            res = MaritalStatuscomponent.ListAllMaritalStatus()
            if res:
                return response_success(res)
            else:
                return response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())

class admin_Marital_Status_getbyid(Resource):
    @staticmethod
    def get(id):
        try:
            HandleLogs.write_log(f"Obtener unidad académica por ID: {id}")
            token = request.headers['tokenapp']
            if token is None:
                return response_error("Error: No se ha podido Obtener el Token")
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()
            res = MaritalStatuscomponent.GetMaritalStatusById(id)
            if res:
                return response_success(res)
            else:
                return response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())

class admin_Marital_Satus_service_add(Resource):
    @staticmethod
    def post():
        try:
            token = request.headers['tokenapp']
            if token is None:
                return response_error("Error: No se ha podido Obtener el Token")
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()
            # Get data from request body
            data_to_update = request.get_json()
            if not data_to_update:
                return response_error("Error en loda datos para procesar")
            #Validar ese Request con mi modelo
            new_request = MaritalStatusInsertRequest()
            error = new_request.validate(data_to_update)
            if error:
                HandleLogs.write_error("Error al Validar el Request -> " + str(error))
                return response_error("Error al Validar el Request -> " + str(error))

            # Update the academy unit
            result = MaritalStatuscomponent.AddMaritalStatus(data_to_update)

            if result['result']:
                return response_success("Id de Registro -> " + str(result['data']))
            else:
                return response_error(result['message'])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())

class admin_Marital_Satus_service_Update(Resource):
    @staticmethod
    def patch():
        try:
            token = request.headers['tokenapp']
            if token is None:
                return response_error("Error: No se ha podido Obtener el Token")
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()
            # Get data from request body
            data_to_update = request.get_json()
            if not data_to_update:
                return response_error("Error en loda datos para procesar")
            #Validar ese Request con mi modelo
            new_request = MaritalStatusUpdateRequest()
            error = new_request.validate(data_to_update)
            if error:
                HandleLogs.write_error("Error al Validar el Request -> " + str(error))
                return response_error("Error al Validar el Request -> " + str(error))

            # Update the academy unit
            result = MaritalStatuscomponent.UpdateMaritalStatus(data_to_update)
            HandleLogs.write_log(result)

            if result['result']:
                if result['data']['data'] < 0:
                    return response_error("Ocurrió un error al actualizar el registro")
                else:
                    if result['data']['data'] == 0:
                        return response_not_found()
                    else:
                        return response_success(data_to_update)
            else:
                return response_error(result['message'])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())

class admin_Marital_Status_Delete(Resource):
    @staticmethod
    def delete(id, user):
        try:
            print(user)
            HandleLogs.write_log(f"Eliminar ciclo por ID: {id}")
            token = request.headers['tokenapp']
            if token is None:
                return response_error("Error: No se ha podido Obtener el Token")
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()
            user_token = TokenComponent.User(token)

            res = MaritalStatuscomponent.DeleteMaritalStatus(id, user_token)

            #success, message = AdminCicleComponent.delete_admin_cicle(id)
            if res:
                return response_success(res)
            else:
                return response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())