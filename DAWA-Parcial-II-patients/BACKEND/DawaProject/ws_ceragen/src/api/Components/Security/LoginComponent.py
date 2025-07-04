from ....utils.common.encrypt_password import compare_password
from ....utils.general.logs import HandleLogs
from ....utils.database.connection_db import DataBaseHandle
from ...Components.Security.rolComponent import RolComponent
from ...Components.Security.moduleComponent import ModuleComponent
from ...Components.Security.menuComponent import MenuComponent
from datetime import datetime

class LoginComponent:
    @staticmethod
    def Login(user, clave):
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
                SELECT us.user_id, us.user_login_id, us.user_mail, us.user_password,
                       us.user_locked, us.user_last_login, pe.per_names, pe.per_surnames
                FROM ceragen.segu_user us
                INNER JOIN ceragen.admin_person pe ON us.user_person_id = pe.per_id
                WHERE user_login_id = %s AND user_state = TRUE
            """
            record = (user,)
            resultado = DataBaseHandle.getRecords(sql, 1, record)
            message = resultado['message']

            if resultado['data'] is None:
                message = f"Cuenta {user} no encontrada"
            else:
                user_data = resultado['data']
                hashed_password = user_data['user_password']
                if not compare_password(clave, hashed_password):
                    # contraseña incorrecta, manejar intentos
                    update_login_attempts = """UPDATE ceragen.segu_user 
                    SET 
                        login_attempts = CASE WHEN login_attempts < 3 THEN login_attempts + 1 ELSE login_attempts END,
                        user_locked = CASE WHEN login_attempts + 1 >= 3 THEN TRUE ELSE FALSE END,
                        user_modified = %s,
                        date_modified = timezone('America/Guayaquil', now())
                    WHERE user_login_id = %s 
                    RETURNING 
                        CASE WHEN login_attempts < 3 THEN 3 - login_attempts ELSE 0 END AS intentos_restantes, 
                        user_locked,
                        user_state;
                    """
                    update_record = (user, user)
                    update_result = DataBaseHandle.ExecuteInsert(update_login_attempts, update_record)
                    if update_result['data']:
                        estado = update_result['data'][0]
                        if estado['user_locked']:
                            message = f'Cuenta {user} bloqueada, consulte con el administrador'
                        elif estado['intentos_restantes'] < 3:
                            message = f'Verifique sus credenciales; intentos restantes: {estado["intentos_restantes"]}'
                        if estado['user_state'] is False:
                            message = f'Cuenta {user} no encontrada'
                    else:
                        message = "Error al actualizar intentos de login"
                elif user_data['user_locked']:
                    message = f"Cuenta {user} está bloqueada"
                else:
                    v_user_id = user_data['user_id']
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

                        data = {
                            'user': convert_datetime_to_string(user_data),
                            'rols': call_rol['data']
                        }
                        result = True
                        HandleLogs.write_log("Login Exitoso para usuario: " + user)
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