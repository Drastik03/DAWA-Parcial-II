from flask_restful import Resource
from ...Components.Admin.PaymentMethodComponent import AdminPaymentMethodComponent
from ...Model.Request.Admin.PaymentRequest import PaymentMethodCreateRequest, PaymentMethodUpdateRequest

from ....utils.general.logs import HandleLogs
from flask import request
from ....utils.general.response import (
    response_success,
    response_not_found,
    response_error,
    response_unauthorize
)

from ...Components.Security.TokenComponent import TokenComponent

class AdminPaymentMethodService_GetAll(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Metodos de pago")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = AdminPaymentMethodComponent.payment_methods_all()
            print("DESDE RESPONSE SERVICE PAYMENT METHOD",res)
            if res["data"]:
                return response_success(res)
            else:
                return response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminPaymentMethodService_GetById(Resource):
    @staticmethod
    def get(pme_id):
        try:
            HandleLogs.write_log(f"Obtener payment por ID: {pme_id}")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = AdminPaymentMethodComponent.get_payment_by_id(pme_id)
            return response_success(res) if res else response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminPaymentMethodService_Add(Resource):
    @staticmethod
    def post():
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.get_json()
            print("DESDE DATA PROMOTION POST: ",data)
            if not data:
                return response_error("Error en los datos para procesar")

            schema = PaymentMethodUpdateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Error al validar el request -> " + str(errors))
                return response_error("Error al validar el request -> " + str(errors))

            result = AdminPaymentMethodComponent.add_payment_method(data)
            if result['result']:
                return response_success("Id de Registro -> " + str(result['data']))
            return response_error(result['message'])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminPaymentMethodService_Update(Resource):
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

            schema = PaymentMethodUpdateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Error al validar el request -> " + str(errors))
                return response_error("Error al validar el request -> " + str(errors))

            result = AdminPaymentMethodComponent.update_payment_method(data)
            if result['result']:
                if result['data']['data'] == 0:
                    return response_not_found()
                return response_success(data)
            return response_error(result['message'])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminPaymentMethodService_Delete(Resource):
    @staticmethod
    def delete(pme_id):
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Error: No se ha podido obtener el token")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            user = TokenComponent.User(token)
            res = AdminPaymentMethodComponent.delete_payment_method(pme_id, user)
            return res
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))
