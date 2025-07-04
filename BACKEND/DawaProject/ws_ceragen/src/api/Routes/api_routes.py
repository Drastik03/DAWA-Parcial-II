from ..Services.Admin.AdminClientService import AdminClientService_GetAll, AdminClientServiceAdd, \
    AdminClientServiceUpdate, AdminClientServiceDelete
from ..Services.Admin.AdminExpenseService import AdminExpenseService_GetAll, AdminExpenseService_Delete, \
    AdminExpenseService_Update, AdminExpenseService_Add, AdminExpenseService_GetById
#----------- MÓDULO ADMINISTRADOR ----------------------------

from ..Services.Admin.AdminPersonService import (AdminPersonService_get,
                                                 AdminPersonService_getbyid,
                                                 admin_Person_service_add,
                                                 admin_Person_service_Update,
                                                 admin_person_service_Delete)


from ..Services.Admin.AdminMaritalStatusservice import (MaritalStatus_get,
                                                        admin_Marital_Status_getbyid,
                                                        admin_Marital_Satus_service_add,
                                                        admin_Marital_Satus_service_Update,
                                                        admin_Marital_Status_Delete)

from ..Services.Admin.AdminParameterListservice import (admin_Parameter_List_service_get,
                                                        admin_Parameter_List_add,
                                                        admin_Parameter_List_Update,
                                                        admin_Parameter_list_Delete)

from ..Services.Admin.AdminPerson_genre_service import (admin_Person_genre_service_get,
                                                        admin_Person_Genre_getbyid,
                                                        admin_Person_Genre_service_add,
                                                        admin_Person_Genre_service_Update,
                                                        admin_Person_Genre_service_Delete)
from ..Services.Admin.AdminProductService import AdminProductService_GetAll, AdminProductService_Add, \
    AdminProductService_Update, AdminProductService_Delete
from ..Services.Admin.DashboardService import DashboardService_GetAll
from ..Services.Admin.ExpenseTypeService import ExpenseTypeService_GetAll, ExpenseTypeServiceAdd, \
    AdminExpenseTypeServiceUpdate, AdminExpenseTypeServiceDelete, ExpenseTypeServiceGetById
from ..Services.Admin.MedicalPersonTypeService import MedicPersonTypeService_GetAll, MedicPersonTypeService_Add, \
    MedicPersonTypeService_Update, MedicPersonTypeService_Delete
from ..Services.Admin.PaymentMethodService import AdminPaymentMethodService_GetAll, AdminPaymentMethodService_Update, \
    AdminPaymentMethodService_Add, AdminPaymentMethodService_Delete
from ..Services.Admin.PromotionProductServices import AdminPromotionService_GetAll, AdminPromotionService_Add, \
    AdminPromotionService_Update
from ..Services.Admin.TherapyTypeService import TherapyTypeService_GetAll, TherapyTypeService_Add, \
    TherapyTypeService_Delete, TherapyTypeService_Update
from ..Services.Patients.ClinicSessionService import ClinicSessionService_GetAll, ClinicSessionService_GetById, \
    ClinicSessionService_Add, ClinicSessionService_Update, ClinicSessionService_Delete
from ..Services.Patients.MedicalHistoryService import MedicalHistoryListService, MedicalHistoryGetByIdService, \
    MedicalHistoryListByPatientIdService, MedicalHistoryInsertService, MedicalHistoryUpdateService, \
    MedicalHistoryDeleteService
from ..Services.Patients.PatientAllergyService import PatientAllergyInsertService, PatientAllergyUpdateService
from ..Services.Patients.PatientDiseaseService import PatientDiseaseInsertService, PatientDiseaseUpdateService
from ..Services.Patients.PatientService import PatientListService, PatientGetByIdService, PatientInsertService, \
    PatientUpdateService, PatientDeleteService
from ..Services.Patients.TherapySessionControlService import TherapySessionControlListService, \
    TherapySessionControlGetByIdService, TherapySessionControlAddService, TherapySessionControlUpdateService, \
    TherapySessionControlDeleteService

from ..Services.Security.LoginService import LoginService
from ..Services.Security.LogoutService import LogoutService
from ..Services.Security.UserService import UserService, UserInsert, UserDelete, UserUpdate,UserpasswordUpdate,RecoveringPassword,EmailPasswordUpdate

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

    # rutas paara el product
    api.add_resource(AdminProductService_GetAll, '/admin/product/list')
    api.add_resource(AdminProductService_Add, '/admin/product/insert')
    api.add_resource(AdminProductService_Update, '/admin/product/update')
    api.add_resource(AdminProductService_Delete, '/admin/product/delete/<int:pro_id>')


    #PROMOTION
    api.add_resource(AdminPromotionService_GetAll, '/admin/promotion/list')
    api.add_resource(AdminPromotionService_Add, '/admin/promotion/insert')
    api.add_resource(AdminPromotionService_Update, '/admin/promotion/update')

    #METODOS DE PAGO
    api.add_resource(AdminPaymentMethodService_GetAll, '/admin/payment_method/list')
    api.add_resource(AdminPaymentMethodService_Add, '/admin/payment_method/insert')
    api.add_resource(AdminPaymentMethodService_Update, '/admin/payment_method/update')
    api.add_resource(AdminPaymentMethodService_Delete, '/admin/payment_method/delete/<int:pme_id>')

    #DASHBOARD
    api.add_resource(DashboardService_GetAll, '/admin/dashboard/list')

    #TIPO DE TERAPIA
    api.add_resource(TherapyTypeService_GetAll, '/admin/therapy-type/list')
    api.add_resource(TherapyTypeService_Add, '/admin/therapy-type/insert')
    api.add_resource(TherapyTypeService_Delete, '/admin/therapy-type/delete/<int:tht_id>')
    api.add_resource(TherapyTypeService_Update, '/admin/therapy-type/update')


    api.add_resource(MedicPersonTypeService_GetAll, '/admin/medicalPersonType/list')
    api.add_resource(MedicPersonTypeService_Add, '/admin/medicalPersonType/insert')
    api.add_resource(MedicPersonTypeService_Update, '/admin/medicalPersonType/update')
    api.add_resource(MedicPersonTypeService_Delete, '/admin/medicalPersonType/delete/<int:mpt_id>')

    #CLIENTES
    api.add_resource(AdminClientService_GetAll, '/admin/client/list')
    api.add_resource(AdminClientServiceAdd, '/admin/client/insert')
    api.add_resource(AdminClientServiceUpdate, '/admin/client/update')
    api.add_resource(AdminClientServiceDelete, '/admin/client/delete/<int:cli_id>')

    #EXPENSES_TYPE
    api.add_resource(ExpenseTypeService_GetAll, '/admin/ExpenseType/list')
    api.add_resource(ExpenseTypeServiceAdd, '/admin/ExpenseType/insert')
    api.add_resource(AdminExpenseTypeServiceUpdate, '/admin/ExpenseType/update')
    api.add_resource(AdminExpenseTypeServiceDelete, '/admin/ExpenseType/delete/<int:ext_id>')
    api.add_resource(ExpenseTypeServiceGetById, '/admin/ExpenseType/<int:ext_id>')

    #expense
    api.add_resource(AdminExpenseService_GetAll, '/admin/expense/list')
    api.add_resource(AdminExpenseService_GetById, '/admin/expense/<int:exp_id>')
    api.add_resource(AdminExpenseService_Add, '/admin/expense/insert')
    api.add_resource(AdminExpenseService_Update, '/admin/expense/update')
    api.add_resource(AdminExpenseService_Delete, '/admin/expense/delete/<int:exp_id>')

    # ----------- MÓDULO PACIENTES ----------------------------
    # Gestión de Pacientes
    api.add_resource(PatientListService, '/clinic/patients/list')  # Listar todos los pacientes
    api.add_resource(PatientGetByIdService, '/clinic/patients/list/<int:pat_id>')  # Obtener paciente por ID
    api.add_resource(PatientInsertService, '/clinic/patients/add')  # Agregar nuevo paciente
    api.add_resource(PatientUpdateService, '/clinic/patients/update/<int:pat_id>')  # Actualizar paciente
    # Eliminar paciente (eliminación lógica), siguiendo el patrón de AdminPersonService
    api.add_resource(PatientDeleteService, '/clinic/patients/delete/<int:pat_id>')

    # Historial Médico
    api.add_resource(MedicalHistoryListService, '/medical-histories/list')  # Listar todas las historias clinicas
    api.add_resource(MedicalHistoryGetByIdService,
                     '/medical-histories/list/<int:hist_id>')  # Obtener Historias por hist_id
    api.add_resource(MedicalHistoryListByPatientIdService, '/medical-histories/patientHist/<int:hist_patient_id>')
    api.add_resource(MedicalHistoryInsertService, '/medical-histories/insert')  # agregar historia
    api.add_resource(MedicalHistoryUpdateService, "/medical-histories/update/<int:hist_id>")  # actualizar historia
    api.add_resource(MedicalHistoryDeleteService, '/medical-histories/delete/<int:hist_id>')  # Eliminar historia

    # Alergias del paciente
    api.add_resource(PatientAllergyInsertService, '/clinic/patient-allergy/add')
    api.add_resource(PatientAllergyUpdateService, '/clinic/patient-allergy/update/<int:pa_id>')

    # Enfermedades del paciente
    api.add_resource(PatientDiseaseInsertService, '/clinic/patient-disease/add')
    api.add_resource(PatientDiseaseUpdateService, '/clinic/patient-disease/update/<int:pd_id>')

    # ----------- MÓDULO CLINIC SESSION ----------------------------
    api.add_resource(ClinicSessionService_GetAll, '/clinic/sessions/list')
    api.add_resource(ClinicSessionService_GetById, '/clinic/sessions/<int:cli_id>')
    api.add_resource(ClinicSessionService_Add, '/clinic/sessions/insert')
    api.add_resource(ClinicSessionService_Update, '/clinic/sessions/update/<int:cli_id>')
    api.add_resource(ClinicSessionService_Delete, '/clinic/sessions/delete/<int:cli_id>')

    # Sesiones de Terapia
    api.add_resource(TherapySessionControlListService, '/clinic/TherapySession/list')
    api.add_resource(TherapySessionControlGetByIdService,
                     '/clinic/TherapySession/list/<int:sec_id>')  # ¡Parámetro en URL actualizado a sec_id!
    api.add_resource(TherapySessionControlAddService, '/clinic/TherapySession/add')
    api.add_resource(TherapySessionControlUpdateService,
                     '/clinic/TherapySession/update/<int:sec_id>')  # ¡Parámetro en URL actualizado a sec_id!
    api.add_resource(TherapySessionControlDeleteService,
                     '/clinic/TherapySession/delete/<int:sec_id>')  # ¡Parámetro en URL actualizado a sec_id!