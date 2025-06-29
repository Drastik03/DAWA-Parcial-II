from flask_restful import Resource
from ...Components.Patients.PatientComponent import PatientComponent
from ....utils.general.logs import HandleLogs
from ....utils.general.response import response_error, response_success, response_not_found, response_unauthorize
from ...Components.Security.TokenComponent import TokenComponent
from ....utils.database.connection_db import DataBaseHandle
from flask import request
from marshmallow import ValidationError
from ...Model.Request.Patients.PatientRequest import PatientInsertRequest, PatientUpdateRequest

class PatientListService(Resource):
    @staticmethod
    def get():
        """
        Servicio para listar todos los pacientes activos.
        """
        try:
            HandleLogs.write_log("Ejecutando servicio de Listar Pacientes")

            #Obtener Token
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido Obtener el Token")

            # Validar que el token sea correcto
            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()

            resultado = PatientComponent.getAllPatients()

            if resultado:
                return response_success(resultado)
            else:
                return response_not_found()

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error("Error inesperado al listar: " + err.__str__())

class PatientGetByIdService(Resource):
    @staticmethod
    def get(pat_id=None):
        """
        Servicio para listar todos los pacientes activos o un paciente por ID.
        """
        try:
            HandleLogs.write_log("Ejecutando servicio de Obtener Pacientes")

            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido Obtener el Token")

            token_valido = TokenComponent.Token_Validate(token)
            if not token_valido:
                return response_unauthorize()

            if pat_id is not None:
                resultado = PatientComponent.getPatientById(pat_id)
                if resultado:
                    return response_success(resultado)
                else:
                    return response_not_found("Paciente no encontrado")
            else:
                resultado = PatientComponent.getAllPatients()
                if resultado:
                    return response_success(resultado)
                else:
                    return response_not_found("No se encontraron pacientes")

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error("Error inesperado al obtener pacientes: " + err.__str__())

class PatientInsertService(Resource):
    @staticmethod
    def post():
        try:
            HandleLogs.write_log("Llamada al servicio de creación de pacientes.")

            # Obtener token
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado.")

            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            # Obtener usuario desde token
            user_created = TokenComponent.User(token)

            # Obtener y preparar datos del request
            data = request.get_json()
            data['user_created'] = user_created  # Inyectar automáticamente

            # Validación del esquema
            schema = PatientInsertRequest()
            validated_data = schema.load(data)

            # Crear paciente
            resultado = PatientComponent.createPatient(validated_data)
            return response_success(resultado)

        except ValidationError as e:
            return response_error("Datos inválidos: " + str(e.messages))
        except Exception as err:
            HandleLogs.write_error(f"Error inesperado en PatientCreateService: {str(err)}")
            return response_error("Error interno al crear paciente.")

class PatientUpdateService(Resource):
    def patch(self, pat_id):
        try:
            HandleLogs.write_log(f"Llamada al servicio de actualización de paciente ID {pat_id}.")

            # Validar token
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha proporcionado token")

            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            # Validar payload JSON con Marshmallow
            json_data = request.get_json(force=True)
            schema = PatientUpdateRequest()
            try:
                data_validated = schema.load(json_data)
            except ValidationError as err:
                return response_error(f"Datos inválidos: {err.messages}")

            # Llamar al componente para actualizar paciente
            result = PatientComponent.updatePatient(pat_id, data_validated)

            if result.get('result'):
                return response_success(result.get('data'))
            else:
                # Si el paciente no existe o falla update, responder not_found o error
                if "no encontrado" in result.get('message', '').lower():
                    return response_not_found(result.get('message'))
                return response_error(result.get('message'))

        except Exception as e:
            HandleLogs.write_error(f"Error inesperado en PatientUpdateService: {str(e)}")
            return response_error("Error interno del servidor al actualizar paciente")

class PatientDeleteService(Resource):
    @staticmethod
    def delete(pat_id): #
        try:
            HandleLogs.write_log(f"Intentando desactivar paciente con ID: {pat_id}")

            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado.")

            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            # Obtener Usuario
            user_deleted = TokenComponent.User(token)

            result = PatientComponent.deletePatient(pat_id, user_deleted)

            if result.get("result"):
                return response_success("Paciente, " + str(pat_id) + " desactivado correctamente." )
            else:
                return response_error(result.get("message", "No se pudo desactivar el paciente"))
        except Exception as e:
            HandleLogs.write_error(f"Error inesperado en PatientDeleteService: {str(e)}")
            return response_error("Error interno al desactivar el paciente.")
