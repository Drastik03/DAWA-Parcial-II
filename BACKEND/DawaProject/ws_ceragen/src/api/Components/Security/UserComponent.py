from ....utils.common.encrypt_password import hashed_password, compare_password
from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from .UserRolComponent import UserRolComponent
from ....api.Components.Security.rolComponent import RolComponent
from ....api.Components.Security.moduleComponent import ModuleComponent
from ....api.Components.Security.menuComponent import MenuComponent
from datetime import datetime
from ....utils.smpt.smpt_officeUG import send_password_recovery_email
class UserComponent:

    @staticmethod
    def ListAllUsers():
        try:
            result = False
            message = None
            data = None
            sql = "SELECT user_id,user_person_id,user_login_id,user_mail FROM ceragen.segu_user WHERE user_state = true;"

            resultado = DataBaseHandle.getRecords(sql, 0)
            HandleLogs.write_log(resultado)
            if resultado['data'] is None:
                result = False
                message = "Error al Busar Datos"

                HandleLogs.write_error("Error al Busar Datos")
            else:
                result = True
                data = resultado['data']

        except Exception as err:
                HandleLogs.write_error(err)
                message = err.__str__()
        finally:
                return {
                    'result': result,
                    'message': message,
                    'data': data
                }
    @staticmethod
    def ListUserId(user_token):
            try:
                def convert_datetime_to_string(data):
                    for key, value in data.items():
                        if isinstance(value, datetime):
                            data[key] = value.isoformat()
                    return data

                result = False
                message = None
                data = None
                sql = """
                    SELECT 
                        us.user_id,
                        us.user_login_id,
                        us.user_mail,
                        us.user_password,
                        us.user_locked,
                        us.user_last_login,
                        pe.per_names,
                        pe.per_surnames,
                        lg.slo_id  -- ← logId
                    FROM ceragen.segu_user us
                    INNER JOIN ceragen.admin_person pe ON us.user_person_id = pe.per_id
                    LEFT JOIN LATERAL (
                        SELECT slo_id
                        FROM ceragen.segu_login
                        WHERE slo_user_id = us.user_id
                        ORDER BY slo_date_start_connection DESC
                        LIMIT 1
                    ) lg ON true
                    WHERE user_login_id = %s
                      AND user_state = TRUE;

                """
                record = (user_token,)

                resultado = DataBaseHandle.getRecords(sql, 1, record)
                HandleLogs.write_log(resultado)
                message = resultado['message']
                if resultado['data'] is None:
                    if resultado['message'] is not None: message = resultado['message']
                    message = "Usuario " + str(user_token) + " no encontrado"
                    HandleLogs.write_error(message)
                else:
                    v_user_id = resultado['data']['user_id']
                    call_rol = RolComponent.getUserRol(v_user_id)

                    if call_rol['result']:
                        for rol in call_rol['data']:
                            call_modules = ModuleComponent.getModuleRol(rol['rol_id'])
                            if call_modules['result']:
                                rol['modules'] = call_modules['data']
                                for module in call_modules['data']:
                                    call_menu = MenuComponent.getMenuRolModule(rol['rol_id'], module['mod_id'])
                                    if call_menu['result']:
                                        module['menu'] = call_menu['data']
                                    else:
                                        message = call_menu['message']
                                        exit()
                            else:
                                message = call_modules['message']
                                exit()
                            # Get Carrer Periods
                            call_carrer_period = RolComponent.getCarrerPeriodRol(rol['rol_id'], v_user_id)
                            if call_carrer_period['result']:
                                rol['carrera_periodo'] = call_carrer_period['data']
                            else:
                                message = call_carrer_period['message']
                                exit()

                        data = {
                            'user': convert_datetime_to_string(resultado['data']),
                            'rols': call_rol['data']
                        }
                        result = True
                        HandleLogs.write_log("Login Exitoso para usuario: " + user_token)
                    else:
                        message = call_rol['message']
            except Exception as err:
                HandleLogs.write_error(err)
                message = err.__str__()
            finally:
                return {
                    'result': result,
                    'message': message,
                    'data': data
                }
    @staticmethod
    def UserInsert(person_id, person_ci, person_password, person_mail, user_id):
        try:
            password_hashed = hashed_password(person_password).decode("utf-8")
            print(password_hashed)
            record = (person_id, person_ci, person_mail,password_hashed,user_id,user_id)
            print(f"Valores que se insertarán: {record}")

            data = None
            sql = """ 
                    INSERT INTO ceragen.segu_user(
                    user_person_id, user_login_id, user_mail, user_password, user_created, date_created,login_attempts)
                    VALUES (%s, %s,%s, %s, %s, timezone('America/Guayaquil', now()),0)
                    ON CONFLICT (user_login_id)
                    DO UPDATE SET 
                        user_state = TRUE,
                        user_modified = %s,
                        date_modified = timezone('America/Guayaquil', now())
                    RETURNING user_id
                """
            resultado = DataBaseHandle.ExecuteInsert(sql,record)
            result = resultado['result']
            message = resultado['message']

            if resultado['data'] is not None:
                value = resultado['data'][0]
                result = True
                data = list(value.values())[0]
                #if rol_id > 0:
                   # response_insert_rol_period = UserRolComponent.UserRolInsert(rol_id, data, id_career_period, user_id)

        except Exception as err:
            HandleLogs.write_error(err)
            message = err.__str__()
        finally:
            return {
                'result': result,
                'message': message,
                'data': data
            }


    @staticmethod
    def UserDelete(user,user_id):
        try:
            record = (user,user_id)
            result = False
            message = None
            data = None
            sql = """UPDATE  ceragen.segu_user SET user_state=False, user_deleted=%s, date_deleted=timezone('America/Guayaquil', now()) WHERE user_id = %s;"""
            answer = DataBaseHandle.ExecuteNonQuery(sql, record)
            HandleLogs.write_log(answer)
            if answer['result'] is True:
                result = True
                data = answer['data']

        except Exception as err:
            HandleLogs.write_error(err)
            message = err.__str__()
            data = None
        finally:
            return {
                'result': result,
                'message': message,
                'data': data
            }
    @staticmethod
    def UserUpdate(user, user_id):
        try:
            record = (user, user_id)
            print(user)
            print(user_id)
            result = False
            message = None
            data = None
            sql = """UPDATE ceragen.segu_user
                        SET 
                            user_locked = CASE WHEN user_locked = FALSE THEN TRUE ELSE FALSE  END,
                            login_attempts = CASE WHEN user_locked = FALSE THEN 3 ELSE 0 END,
                            user_modified = %s,
                            date_modified = timezone('America/Guayaquil', now())
                        WHERE user_id = %s;
                        """
            answer = DataBaseHandle.ExecuteNonQuery(sql, record)
            HandleLogs.write_log(answer)
            if answer['result'] is True:
                result = True
                data = answer['data']

        except Exception as err:
            HandleLogs.write_error(err)
            message = err.__str__()
            data = None
        finally:
            return {
                'result': result,
                'message': message,
                'data': data
            }
    @staticmethod
    def UserUpdate_time_login(user_id):
        try:
            result = False
            message = None
            data = None
            sql = "UPDATE ceragen.segu_user SET user_last_login = timezone('America/Guayaquil', now() ), login_attempts =  0 WHERE user_login_id = %s"
            record = (user_id,)
            answer = DataBaseHandle.ExecuteNonQuery(sql, record)
            HandleLogs.write_log(answer)
            if answer['result'] is True:
                result = True
                data = answer['data']

        except Exception as err:
            HandleLogs.write_error(err)
            message = err.__str__()
            data = None
        finally:
            return {
                'result': result,
                'message': message,
                'data': data
            }
    @staticmethod
    def UserPasswordUpdate(new_password, user, user_id, old_password):
        try:
            HandleLogs.write_log(f"user: {user}, user_id: {user_id}")
            query = """
                   SELECT user_password FROM ceragen.segu_user
                   WHERE user_id = %s AND user_locked = false AND user_state = true
               """
            current_data = DataBaseHandle.getRecord(query, 1, (user_id,))
            HandleLogs.write_log(f"current_data: {current_data}")

            if not current_data or 'user_password' not in current_data:
                return {'result': False, 'message': "Usuario no encontrado", 'data': None}
            current_hashed = current_data['user_password']

            if not compare_password(old_password, current_hashed):
                return {'result': False, 'message': "Contraseña actual incorrecta", 'data': None}

            new_hashed = hashed_password(new_password).decode("utf-8")

            update_sql = """
                   UPDATE ceragen.segu_user
                   SET user_password = %s, user_modified = %s, date_modified = timezone('America/Guayaquil', now())
                   WHERE user_id = %s
               """
            record = (new_hashed, user, user_id)
            answer = DataBaseHandle.ExecuteNonQuery(update_sql, record)

            HandleLogs.write_log(f"Respuesta actualización: {answer}")

            if answer['result'] is True:
                return {
                    'result': True,
                    'message': "Contraseña actualizada correctamente",
                    'data': answer['data']
                }
            else:
                return {
                    'result': False,
                    'message': answer['message'],
                    'data': None
                }

        except Exception as err:
            HandleLogs.write_error(err)
            return {
                'result': False,
                'message': str(err),
                'data': None
            }

    @staticmethod
    def UserMailPassword(email):
        try:
            HandleLogs.write_log('email: ' + email)
            result = False
            message = None
            data = None

            record = (email,)
            sql = """
                SELECT user_login_id
                FROM ceragen.segu_user
                WHERE user_mail = %s;
            """
            answer = DataBaseHandle.getRecords(sql, 1, record)
            HandleLogs.write_log(answer)

            if answer['result'] is True and answer['data'] is not None:
                user_id = answer['data']["user_login_id"]
                answer_to_send = send_password_recovery_email(email, user_id)
                result = answer_to_send['result']
                data = answer_to_send['data']
                message = answer_to_send['message']
            else:
                HandleLogs.write_log(answer['message'])
                message = (
                    f"El correo {email} no se encuentra registrado"
                    if answer['message'] is None else answer['message']
                )
        except Exception as err:
            HandleLogs.write_error(err)
            message = err.__str__()
            data = None
        finally:
            return {
                'result': result,
                'message': message,
                'data': data
            }

    @staticmethod
    def UsePaswoedUpdateMail(user_id, new_password, user_mail):
        try:
            hashed = hashed_password(new_password).decode("utf-8")
            record = (hashed,user_id,user_id,user_mail)
            result = False
            message = None
            data = None
            sql = """UPDATE ceragen.segu_user
                        SET 
                            user_password = %s,
                            user_modified =  %s,
                            date_modified = timezone('America/Guayaquil', now())
                        WHERE 
                            user_login_id = %s 
                            AND user_mail = %s;
                    """
            answer = DataBaseHandle.ExecuteNonQuery(sql, record)
            HandleLogs.write_log(answer)
            if answer['result'] is True:
                result = True
                data = answer['data']
            else:
                message = answer['message']
        except Exception as err:
            HandleLogs.write_error(err)
            message = err.__str__()
            data = None
        finally:
            return {
                'result': result,
                'message': message,
                'data': data
            }
