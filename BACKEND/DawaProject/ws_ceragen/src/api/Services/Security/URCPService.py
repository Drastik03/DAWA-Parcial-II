from flask import request
from flask_restful import Resource
from ....api.Model.Request.Security.DeleteService import DeleteServiceSchema
from ....api.Model.Request.Security.Updateurcp import UpdateurcpSchema
from ....api.Model.Request.Security.Inserturcp import InserturcpSchema
from ....api.Model.Request.Security.SelectFaculty import SelectFacultySchema
from ....api.Components.Security.TokenComponent import TokenComponent
from ....api.Components.Security.URCPComponent import urcpComponent
from ....utils.general.logs import HandleLogs
from ....utils.general.response import response_success, response_error, response_unauthorize, response_not_found

class urcpList(Resource):
    @staticmethod
    def get():

        try:
            HandleLogs.write_log("Listado de Asignaciones por Periodos_Carreras")
            # Obtengo el token
            token = request.headers['tokenapp']
            if token is None:
                return response_error("Error: No se ha podido Obtener el Token")

            # Validar el Token
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()

            # LLamar al metodo del componente
            answer = urcpComponent.Userol_CarrerPeriodList()
            if answer['result'] is True:
                if answer['data'] is None or len(answer['data']) == 0:
                    return response_not_found()
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())

class CareerPeriodActive_List(Resource):
    @staticmethod
    def get():

        try:
            HandleLogs.write_log("Listado de Usuarios_Rol_Periodos_Carreras Activos")
            # Obtengo el token
            token = request.headers['tokenapp']
            if token is None:
                return response_error("Error: No se ha podido Obtener el Token")

            # Validar el Token
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()

            # LLamar al metodo del componente
            answer = urcpComponent.Userol_CarrerPeriodList()
            if answer['result'] is True:
                if answer['data'] is None or len(answer['data']) == 0:
                    return response_not_found()
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())

class faculty_period_active(Resource):
    @staticmethod
    def post():

        try:
            HandleLogs.write_log("Selecionar Carrera-Periodo activos por facultad")
            token = request.headers['tokenapp']
            rq_json = request.get_json()
            new_request = SelectFacultySchema()
            error = new_request.validate(rq_json)
            if error:
                HandleLogs.write_error("Error al Validar el Request -> " + str(error))
                return response_error("Error al Validar el Request -> " + str(error))
            # LLamar al metodo del componente
            if token is None:
                return response_error("Error: No se ha podido Obtener el Token")

            # Validar el Token
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()
            user_name = TokenComponent.User(token)
            # LLamar al metodo del componente
            answer = urcpComponent.Userol_CarrerPeriodActive(rq_json['id_unit'])
            if answer['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())


class Deleteurcp(Resource):
    @staticmethod
    def patch():
        try:
            HandleLogs.write_log("Eliminar urcp")
            token = request.headers['tokenapp']
            rq_json = request.get_json()
            new_request = DeleteServiceSchema()
            error = new_request.validate(rq_json)
            if error:
                HandleLogs.write_error("Error al Validar el Request -> " + str(error))
                return response_error("Error al Validar el Request -> " + str(error))
            # LLamar al metodo del componente
            if token is None:
                return response_error("Error: No se ha podido Obtener el Token")

            # Validar el Token
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()
            user_name = TokenComponent.User(token)
            # LLamar al metodo del componente
            answer = urcpComponent.Userol_CarrerPeriodDelete(rq_json['del_id'], user_name)
            if answer['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())

class Updateurcp(Resource):
    @staticmethod
    def patch():
        try:
            HandleLogs.write_log("Actualizar urcp")
            token = request.headers['tokenapp']
            rq_json = request.get_json()
            new_request = UpdateurcpSchema()
            error = new_request.validate(rq_json)
            if error:
                HandleLogs.write_error("Error al Validar el Request -> " + str(error))
                return response_error("Error al Validar el Request -> " + str(error))
            # LLamar al metodo del componente
            if token is None:
                return response_error("Error: No se ha podido Obtener el Token")

            # Validar el Token
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()
            user_name = TokenComponent.User(token)
            # LLamar al metodo del componente
            answer = urcpComponent.Userol_CarrerPeriodUpdate(rq_json['cp_id'], user_name,rq_json['urcp_id'])
            if answer['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())

class Inserturcp(Resource):
    @staticmethod
    def post():
        try:
            HandleLogs.write_log("Insertar urcp")
            token = request.headers['tokenapp']
            rq_json = request.get_json()
            new_request = InserturcpSchema()
            error = new_request.validate(rq_json)
            if error:
                HandleLogs.write_error("Error al Validar el Request -> " + str(error))
                return response_error("Error al Validar el Request -> " + str(error))
            # LLamar al metodo del componente
            if token is None:
                return response_error("Error: No se ha podido Obtener el Token")

            # Validar el Token
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()
            user_name = TokenComponent.User(token)
            # LLamar al metodo del componente
            answer = urcpComponent.Userol_CarrerPeriodInsert(rq_json['cp_id'], rq_json['ur_id'],  user_name)
            if answer['result'] is True:
                return response_success(answer['data'])
            else:
                return response_error(answer['message'])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(err.__str__())

