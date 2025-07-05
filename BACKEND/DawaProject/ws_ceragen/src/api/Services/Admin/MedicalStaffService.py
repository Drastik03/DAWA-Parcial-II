from flask_restful import Resource
from flask import request

from ....utils.general.logs import HandleLogs
from ....utils.general.response import (
    response_success,
    response_not_found,
    response_error,
    response_unauthorize
)

from ...Components.Admin.MedicalStaffComponent import MedicalStaffComponent
from ...Components.Security.TokenComponent import TokenComponent
from ...Model.Request.Admin.MedicalStaffRequest import (MedicalStaffInsertRequest, MedicalStaffUpdateRequest,
                                                        MedicalStaffDeleteRequest)
from ...Model.Request.Admin.MedicalStaffRequest import MedicalStaffResponse,MedicalStaffListResponse


class MedicalStaffService_GetAll(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log(f"Obtener todos los registros de personal médico.")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado", 401)
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = MedicalStaffComponent.getAllMedicalStaff() # Llama al nuevo método del componente

            if res["result"]:
                if res["data"] is not None:
                    schema = MedicalStaffListResponse()
                    serialized_data = schema.dump({"data": res["data"]})
                    response_payload = {
                        "data": res["data"],
                        "message": res["message"],
                        "result": res["result"]
                    }
                    serialized_response = schema.dump(response_payload)
                    return response_success(serialized_response)

                else:
                    return response_not_found("No se encontraron registros de personal médico.")
            else:
                return response_error(res["message"])

        except Exception as err:
            HandleLogs.write_error(f"Error en MedicalStaffService_GetAll: {str(err)}")
            return response_error(str(err))

class MedicalStaffService_GetById(Resource):
    @staticmethod
    def get(med_id):
        try:
            HandleLogs.write_log(f"Obtener todos los registros de personal médico.")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado", 401)
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = MedicalStaffComponent.getMedicalStaffById(med_id)

            if res["result"]:
                if res["data"]: # res["data"] es el diccionario (o RealDictRow) del componente
                    # *** ESTE ES EL PASO CRÍTICO: SERIALIZAR CON MARSHMALLOW ***
                    schema = MedicalStaffResponse() # Instancia tu esquema de respuesta
                    serialized_data = schema.dump(res["data"]) # Usa .dump() aquí
                    return response_success(serialized_data) # Devuelve los datos YA serializados

                else:
                    return response_not_found("Personal médico no encontrado.")
            else:
                return response_error(res["message"])

        except Exception as err:
            HandleLogs.write_error(f"Error en MedicalStaffService_GetById: {str(err)}")
            return response_error(str(err))

class MedicalStaffService_Add(Resource):
    @staticmethod
    def post():
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado", 401)
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            json_data = request.get_json()
            if not json_data:
                return response_error("Datos inválidos (JSON vacío o malformado)", 400)

            schema = MedicalStaffInsertRequest()
            # REMOVIDO: try...except ValidationError
            data = schema.load(json_data)

            data["user_created"] = TokenComponent.User(token)

            result = MedicalStaffComponent.createMedicalStaff(data)

            if result["result"]:
                if result.get("data") and result["data"].get("med_id"):
                    return response_success({"med_id": result["data"]["med_id"]})
                else:
                    return response_success({})
            else:
                return response_error(result["message"])

        except Exception as err:
            HandleLogs.write_error(f"Error en MedicalStaffService_Add: {str(err)}")

            return response_error(str(err))

class MedicalStaffService_Update(Resource):
    @staticmethod
    def patch(med_id):
        try:
            HandleLogs.write_log(f"Actualizar personal médico ID: {med_id} - Inicio del servicio.")

            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado", 401)
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            json_data = request.get_json()
            if not json_data:
                return response_error("Datos inválidos (JSON vacío o malformado)", 400)

            schema = MedicalStaffUpdateRequest()
            data = schema.load(json_data, partial=True)

            data["user_modified"] = TokenComponent.User(token)

            result = MedicalStaffComponent.updateMedicalStaff(med_id, data)

            if result["result"]:
                if result.get("data") and result["data"].get("med_id"):
                    return response_success({"med_id": result["data"]["med_id"]})
                else:
                    return response_success({"message": "Personal médico actualizado exitosamente."})
            else:
                if "no encontrado" in result["message"].lower() or "no se pudo actualizar" in result["message"].lower():
                    return response_not_found()
                else:
                    return response_error(result["message"])

        except Exception as err:
            HandleLogs.write_error(f"Error en MedicalStaffService_Update: {str(err)}")
            return response_error(f"Error interno del servidor al actualizar personal médico: {str(err)}")



class MedicalStaffService_Delete(Resource):
    @staticmethod
    def delete(med_id):
        try:
            HandleLogs.write_log(f"Inactivando personal médico ID: {med_id} - Inicio del servicio.")

            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado", 401)
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            json_data = request.get_json()
            if not json_data:
                return response_error("Datos inválidos (JSON vacío o malformado). Se espera 'user_deleted'.", 400)

            schema = MedicalStaffDeleteRequest()
            data = schema.load(json_data)

            user_deleted_by_token = TokenComponent.User(token)

            result = MedicalStaffComponent.deleteMedicalStaff(med_id, user_deleted_by_token)

            HandleLogs.write_log(f"Resultado completo del componente en el servicio: {result}")

            if result["result"]:
                return response_success({"message": result["message"]})
            else:
                if "no encontrado" in result["message"].lower() or "ya estaba inactivo" in result["message"].lower():
                    return response_not_found()
                else:
                    return response_error(result["message"])

        except Exception as err:
            HandleLogs.write_error(f"Error en MedicalStaffService_Delete: {str(err)}")
            return response_error(f"Error interno del servidor al inactivar personal médico: {str(err)}")
