from flask_restful import Resource
from flask import request

from .cloud_service import UploadImageService
from ...Components.Admin.InvoicePaymentComponent import InvoicePaymentComponent
from ...Model.Request.Admin.InvoicePaymentRequest import InvoicePaymentCreateRequest, InvoicePaymentUpdateRequest
from ....utils.common.convert_float import convert_decimal_to_float
from ....utils.general.logs import HandleLogs
from ....utils.general.response import (
    response_success,
    response_not_found,
    response_error,
    response_unauthorize
)
from ...Components.Security.TokenComponent import TokenComponent


class AdminInvoicePaymentService_GetAll(Resource):
    @staticmethod
    def get():
        try:
            HandleLogs.write_log("Listado de pagos de facturas")

            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")

            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = InvoicePaymentComponent.ListAllPayments()
            if res and res['result']:
                data = convert_decimal_to_float(res["data"])
                return response_success(data) if data else response_not_found()

            return response_error("No existen datos de pagos")
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminInvoicePaymentService_GetById(Resource):
    @staticmethod
    def get(inp_id):
        try:
            HandleLogs.write_log(f"Consulta de pago de factura por ID {inp_id}")
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = InvoicePaymentComponent.GetPaymentById(inp_id)
            return response_success(res) if res and res["data"] else response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminInvoicePaymentService_Add(Resource):
    @staticmethod
    def post():
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            data = request.form.to_dict()
            file = request.files.get("file")

            schema = InvoicePaymentCreateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Errores en validación: " + str(errors))
                return response_error("Errores en validación: " + str(errors))

            if file:
                upload_res = UploadImageService.upload_image(file, folder="invoice_payments")
                if not upload_res["result"]:
                    return response_error(upload_res["message"])
                data["inp_proof_image_path"] = upload_res["url"]
            else:
                url_image = data.get("inp_proof_image_path")
                if url_image:
                    data["inp_proof_image_path"] = url_image
                else:
                    data["inp_proof_image_path"] = None

            data["user_process"] = TokenComponent.User(token)

            result = InvoicePaymentComponent.AddPayment(data)
            if result["result"]:
                return response_success(f"Id de Registro -> {result['data']}")
            return response_error(result["message"])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminInvoicePaymentService_Update(Resource):
    @staticmethod
    def patch():
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()
            data = request.form.to_dict()
            file = request.files.get("file")
            if "inp_id" not in data or not data["inp_id"]:
                return response_error("Datos inválidos o ID faltante")
            schema = InvoicePaymentUpdateRequest()
            errors = schema.validate(data)
            if errors:
                HandleLogs.write_error("Errores en validación: " + str(errors))
                return response_error("Errores en validación: " + str(errors))
            if file:
                upload_res = UploadImageService.upload_image(file, folder="invoice_payments")
                if not upload_res["result"]:
                    return response_error(upload_res["message"])
                data["inp_proof_image_path"] = upload_res["url"]
            else:
                url_image = data.get("inp_proof_image_path")
                if url_image:
                    data["inp_proof_image_path"] = url_image
                else:
                    data["inp_proof_image_path"] = None
            data["user_process"] = TokenComponent.User(token)
            result = InvoicePaymentComponent.UpdatePayment(data)
            if result["result"]:
                return response_success("Pago de factura actualizado correctamente")
            return response_error(result["message"])
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))

class AdminInvoicePaymentService_Delete(Resource):
    @staticmethod
    def delete(inp_id):
        try:
            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            user = TokenComponent.User(token)
            result = InvoicePaymentComponent.DeletePayment(inp_id, user)
            if result["result"]:
                return response_success(result["message"])
            return response_not_found(result["message"])

        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))


class AdminInvoicePaymentService_GetByInvoiceId(Resource):
    @staticmethod
    def get(inv_id):
        try:
            HandleLogs.write_log(f"Consulta de pagos por invoice_id {inv_id}")

            token = request.headers.get('tokenapp')
            if not token:
                return response_error("Token no proporcionado")
            if not TokenComponent.Token_Validate(token):
                return response_unauthorize()

            res = InvoicePaymentComponent.GetPaymentsByInvoiceId(inv_id)
            return response_success(res["data"]) if res and res["result"] else response_not_found()
        except Exception as err:
            HandleLogs.write_error(err)
            return response_error(str(err))
