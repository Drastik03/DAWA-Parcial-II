

#----------- MÓDULO ADMINISTRADOR ----------------------------

from ..Services.Admin.AdminPersonService import (AdminPersonService_get, AdminPersonService_getbyid,
                                                 admin_Person_service_add, admin_Person_service_Update,
                                                 admin_person_service_Delete)


from ..Services.Admin.AdminMaritalStatusservice import (MaritalStatus_get, admin_Marital_Status_getbyid,
                                                        admin_Marital_Satus_service_add, admin_Marital_Satus_service_Update,
                                                        admin_Marital_Status_Delete)

from ..Services.Admin.AdminParameterListservice import (admin_Parameter_List_service_get, admin_Parameter_List_add,
                                                        admin_Parameter_List_Update, admin_Parameter_list_Delete)

from ..Services.Admin.AdminPerson_genre_service import (admin_Person_genre_service_get, admin_Person_Genre_getbyid,
                                                        admin_Person_Genre_service_add, admin_Person_Genre_service_Update,
                                                        admin_Person_Genre_service_Delete)

from ..Services.Security.LoginService import LoginService
from ..Services.Security.LogoutService import LogoutService
from ..Services.Security.UserService import (UserService, UserInsert, UserDelete, UserUpdate,UserpasswordUpdate,
                                             RecoveringPassword,EmailPasswordUpdate)

from ..Services.Security.MenuService import MenuService, DeleteMenu, UpdateMenu, InsertMenu
from ..Services.Security.RolSistemService import RolSistemService, DeleteRolSistem, UpdateRolSistem, InsertRolSistem
from ..Services.Security.ModuloService import ModuleService, DeleteModulo, UpdateModulo, InsertModulo
from ..Services.Security.UserRolService import UserRolService, DeleteUserRol,InsertUserRol,UpdateUserRol
from ..Services.Security.GetPersonService import GetPersonService
from ..Services.Security.NotificationService import NotificationDelete

from ..Services.Security.MenuRolServices import MenuRolService,InsertMenuRol,DeleteMenuRol, UpdateMenuRol
from ..Services.Security.NotificationService import NotificationService, NotificationRead
from ..Services.Audit.AuditService import AuditService
from ..Services.Audit.ErrorService import ErrorService
from ..Services.Security.URCPService import urcpList,Updateurcp,Deleteurcp,Inserturcp
from ..Services.Security.UserService import UserListId
#-------------------------------------------------------------------------------
#user/insert
#-------------------------------------------------------------------------------

#----------- MÓDULO PACIENTES ----------------------------
#Gestión de Pacientes
from ..Services.Patients.PatientService import (PatientListService,PatientGetByIdService,
                                                PatientInsertService, PatientUpdateService, PatientDeleteService)
# Historial Médico
from ..Services.Patients.MedicalHistoryService import (MedicalHistoryListService, MedicalHistoryGetByIdService, MedicalHistoryInsertService, \
        MedicalHistoryUpdateService, MedicalHistoryDeleteService, MedicalHistoryListByPatientIdService)

# Alergia Pacientes
from ..Services.Patients.PatientAllergyService import (
    PatientAllergyInsertService,
    PatientAllergyUpdateService
)

#Disease Servicios
from ..Services.Patients.PatientDiseaseService import (
    PatientDiseaseInsertService,
    PatientDiseaseUpdateService
)
#clinica sesiones
from ..Services.Patients.ClinicSessionService import (
    ClinicSessionService_GetAll, ClinicSessionService_GetById,
    ClinicSessionService_Add, ClinicSessionService_Update,
    ClinicSessionService_Delete)

from ..Services.Patients.TherapySessionControlService import (
    TherapySessionControlListService,
    TherapySessionControlGetByIdService,
    TherapySessionControlAddService,
    TherapySessionControlUpdateService,
    TherapySessionControlDeleteService
)


def load_routes(api):

    # Ruta de Tabla Person
    api.add_resource(AdminPersonService_get, '/admin/persons/list')   # List
    api.add_resource(AdminPersonService_getbyid, '/admin/persons/list/<int:id>')  # List for ID
    api.add_resource(admin_Person_service_add, '/admin/persons/add')   # Add
    api.add_resource(admin_Person_service_Update, '/admin/persons/update')   # Update
    api.add_resource(admin_person_service_Delete, '/admin/persons/delete/<int:per_id>/<string:user>')  # Delete

    # Ruta de Tabla Marital Status
    api.add_resource(MaritalStatus_get, '/admin/Marital_status/list')   # List
    api.add_resource(admin_Marital_Status_getbyid, '/admin/Marital_status/list/<int:id>')  # List for ID
    api.add_resource(admin_Marital_Satus_service_add, '/admin/Marital_status/add')   # Add
    api.add_resource(admin_Marital_Satus_service_Update, '/admin/Marital_status/update')   # Update
    api.add_resource(admin_Marital_Status_Delete, '/admin/Marital_status/delete/<int:id>/<string:user>')  # Delete

    # Ruta de Tabla Parameter List
    api.add_resource(admin_Parameter_List_service_get, '/admin/Parameter_list/list')   # List

    api.add_resource(admin_Parameter_List_add, '/admin/Parameter_list/add')   # Add
    api.add_resource(admin_Parameter_List_Update, '/admin/Parameter_list/update')   # Update
    api.add_resource(admin_Parameter_list_Delete,'/admin/Parameter_list/delete/<int:id>/<string:user>')  # Delete

    # Ruta de Tabla Person Genre
    api.add_resource(admin_Person_genre_service_get, '/admin/Person_genre/list')   # List
    api.add_resource(admin_Person_Genre_getbyid, '/admin/Person_genre/list/<int:id>')  # List for ID
    api.add_resource(admin_Person_Genre_service_add, '/admin/Person_genre/add')   # Add
    api.add_resource(admin_Person_Genre_service_Update, '/admin/Person_genre/update')   # Update
    api.add_resource(admin_Person_Genre_service_Delete, '/admin/Person_genre/delete/<int:id>/<string:user>')  # Delete
    #******* SECURITY PATH ******#
    #metodo para el login
    api.add_resource(LoginService, '/security/login')
    api.add_resource(LogoutService, '/security/logout')
    api.add_resource(UserListId, '/user/actulization/data')
    api.add_resource(UserService, '/user/list')
    api.add_resource(UserInsert, '/user/insert')
    api.add_resource(UserDelete, '/user/delete')
    api.add_resource(UserUpdate, '/user/update')
    api.add_resource(UserpasswordUpdate, '/user/change-password')
    api.add_resource(RecoveringPassword, '/security/recover-password')
    api.add_resource(EmailPasswordUpdate, '/security/change-password')
    api.add_resource(GetPersonService, '/person/get')

    api.add_resource(InsertRolSistem, '/RolSistem/insert')
    api.add_resource(RolSistemService, '/RolSistem/list')
    api.add_resource(DeleteRolSistem, '/RolSistem/delete')
    api.add_resource(UpdateRolSistem, '/RolSistem/update')


    api.add_resource(UserRolService, '/UserRol/list')
    api.add_resource(DeleteUserRol, '/UserRol/delete')
    api.add_resource(InsertUserRol, '/UserRol/insert')
    api.add_resource(UpdateUserRol, '/UserRol/update')

    api.add_resource(InsertModulo, '/Module/insert')
    api.add_resource(ModuleService, '/Module/list')
    api.add_resource(DeleteModulo, '/Module/delete')
    api.add_resource(UpdateModulo, '/Module/update')

    api.add_resource(InsertMenu, '/Menu/insert')
    api.add_resource(MenuService, '/Menu/list')
    api.add_resource(DeleteMenu, '/Menu/delete')
    api.add_resource(UpdateMenu, '/Menu/update')

    api.add_resource(MenuRolService, '/MenuRol/list')
    api.add_resource(DeleteMenuRol, '/MenuRol/delete')
    api.add_resource(UpdateMenuRol, '/MenuRol/update')
    api.add_resource(InsertMenuRol, '/MenuRol/insert')

    api.add_resource(AuditService, '/Audit/list')
    api.add_resource(ErrorService, '/Error/list')

    api.add_resource(NotificationService, '/Notification/list')
    api.add_resource(NotificationRead, '/Notification/read')

    api.add_resource(NotificationDelete, '/Notification/delete')

    api.add_resource(urcpList,'/urcp/list')
    api.add_resource(Inserturcp, '/urcp/insert')
    api.add_resource(Updateurcp, '/urcp/update')
    api.add_resource(Deleteurcp, '/urcp/delete')


    # ----------- MÓDULO PACIENTES ----------------------------
    # Gestión de Pacientes
    api.add_resource(PatientListService, '/clinic/patients/list')  # Listar todos los pacientes
    api.add_resource(PatientGetByIdService, '/clinic/patients/list/<int:pat_id>')  # Obtener paciente por ID
    api.add_resource(PatientInsertService, '/clinic/patients/add')  # Agregar nuevo paciente
    api.add_resource(PatientUpdateService, '/clinic/patients/update/<int:pat_id>') # Actualizar paciente
    # Eliminar paciente (eliminación lógica), siguiendo el patrón de AdminPersonService
    api.add_resource(PatientDeleteService, '/clinic/patients/delete/<int:pat_id>')

    # Historial Médico
    api.add_resource(MedicalHistoryListService, '/medical-histories/list') # Listar todas las historias clinicas
    api.add_resource(MedicalHistoryGetByIdService, '/medical-histories/list/<int:hist_id>') # Obtener Historias por hist_id
    api.add_resource(MedicalHistoryListByPatientIdService, '/medical-histories/patientHist/<int:hist_patient_id>')
    api.add_resource(MedicalHistoryInsertService, '/medical-histories/insert') # agregar historia
    api.add_resource(MedicalHistoryUpdateService, "/medical-histories/update/<int:hist_id>") # actualizar historia
    api.add_resource(MedicalHistoryDeleteService, '/medical-histories/delete/<int:hist_id>') # Eliminar historia

  # Alergias del paciente
    api.add_resource(PatientAllergyInsertService, '/clinic/patient-allergy/add')
    api.add_resource(PatientAllergyUpdateService, '/clinic/patient-allergy/update/<int:pa_id>')

    # Enfermedades del paciente
    api.add_resource(PatientDiseaseInsertService, '/clinic/patient-disease/add')
    api.add_resource(PatientDiseaseUpdateService, '/clinic/patient-disease/update/<int:pd_id>')

    # ----------- MÓDULO CLINIC SESSION ----------------------------
    api.add_resource(ClinicSessionService_GetAll, '/clinic/sessions/list')
    api.add_resource(ClinicSessionService_GetById, '/clinic/sessions/list/<int:cli_id>')
    api.add_resource(ClinicSessionService_Add, '/clinic/sessions/add')
    api.add_resource(ClinicSessionService_Update, '/clinic/sessions/update/<int:cli_id>')
    api.add_resource(ClinicSessionService_Delete, '/clinic/sessions/delete/<int:cli_id>')

    # Sesiones de Terapia
    api.add_resource(TherapySessionControlListService, '/clinic/TherapySession/list')
    api.add_resource(TherapySessionControlGetByIdService, '/clinic/TherapySession/list/<int:sec_id>') # ¡Parámetro en URL actualizado a sec_id!
    api.add_resource(TherapySessionControlAddService, '/clinic/TherapySession/add')
    api.add_resource(TherapySessionControlUpdateService, '/clinic/TherapySession/update/<int:sec_id>') # ¡Parámetro en URL actualizado a sec_id!
    api.add_resource(TherapySessionControlDeleteService, '/clinic/TherapySession/delete/<int:sec_id>') # ¡Parámetro en URL actualizado a sec_id!
