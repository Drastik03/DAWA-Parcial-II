import { lazy } from "react";
import { Navigate } from "react-router-dom";
import Loadable from "../layouts/full/shared/loadable/Loadable";
import { Protected } from "../components/auth/Protected";
import GenreTableList from "../views/pages/admin/genre/GenreTable";
import PromotionTableList from "../views/pages/admin/promotion/PromotionTable";
import ExpenseReportPagination from "../views/pages/admin/expense/ExpenseReport";
import FormExpenseRegister from "../views/pages/admin/expense/RegisterExpense";
import ExpenseTypeList from "../views/pages/admin/expense/ExpenseTypeList";
import AuditTableList from "../views/pages/admin/audit/AuditTable";
import PersonalMedical from "../views/pages/admin/medicalStaff/PersonalMedical";
import MedicPersonType from "../views/pages/admin/medical/MedicPersonType";
import MethodPaymentTable from "../views/pages/admin/payment/MethodPaymentTable";
import TherapyTypeTable from "../views/pages/admin/therapy/TherapyTypeTable";
import ClientsPage from "../views/pages/admin/clients/ClientsPage";
import PatientPage from "../views/pages/patients/medical-patient/PatientPage";
import { PatientDiseasePage } from "../views/pages/patients/medical-patient/patientdetail/PatientDiseasePage";
import PatientMedicalHistoryPage from "../views/pages/patients/medical-histories/PatientMedicalHistoryPage";
import TherapySessionsByNurseReport from "../views/pages/patients/sessions/TherapySessionsByNurseReport";
import SessionTablePage from "../views/pages/patients/sessions/newSesion/SessionTablePage";
import InvoicePage from "../views/pages/admin/invoice/normalInvoice/InvoicePage";
import TaxPage from "../views/pages/admin/tax/TaxPage";
import { patch } from "@mui/system";
import DiseaseTypePage from "../views/pages/patients/diseasse-type/DiseaseTypePage";
import DiseasePage from "../views/pages/patients/dissease-catalog/DiseasePage";
import InvoiceDataOverview from "../views/pages/admin/invoice/overview/InvoiceDataOverview";
import PatientAllergyPage from "../views/pages/patients/patient-allergy/PatientAllergyPage.JSX";

// Layouts
const FullLayout = Loadable(lazy(() => import("../layouts/full/FullLayout")));
const BlankLayout = Loadable(
	lazy(() => import("../layouts/blank/BlankLayout")),
);

// Auth Pages
const Login = Loadable(
	lazy(() => import("../views/authentication/auth1/Login")),
);
const ForgotPassword = Loadable(
	lazy(() => import("../views/authentication/auth1/ForgotPassword")),
);
const ResetPasswordPage = Loadable(
	lazy(() => import("../views/authentication/auth1/RecoverPassword")),
);
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
const Error = Loadable(lazy(() => import("../views/authentication/Error")));

// Dashboard
const ModernDash = Loadable(lazy(() => import("../views/dashboard/Modern")));
const EcommerceDash = Loadable(
	lazy(() => import("../views/dashboard/Ecommerce")),
);

// Sistema - Admin/Security Pages
const UserList = Loadable(
	lazy(() => import("../views/pages/admin/users/UserList")),
);
const FormUser = Loadable(
	lazy(() => import("../views/pages/admin/users/FormUserRegister")),
);

const PersonsList = Loadable(
	lazy(() => import("../views/pages/admin/persons/PersonsList")),
);
const FormPerson = Loadable(
	lazy(() => import("../views/pages/admin/persons/FormLoginPerson")),
);

const ModuleList = Loadable(
	lazy(() => import("../views/pages/admin/module/ModuleTableList")),
);
const FormModule = Loadable(
	lazy(() => import("../views/pages/admin/module/FormModuleRegister")),
);

const MenuList = Loadable(
	lazy(() => import("../views/pages/admin/menu/MenuTableList")),
);
const MenuRegister = Loadable(
	lazy(() => import("../views/pages/admin/menu/FormRegisterMenu")),
);
const FormAsignarMenuRol = Loadable(
	lazy(() => import("../views/pages/admin/menu/FormAsignarMenuRol")),
);

const RoleList = Loadable(
	lazy(() => import("../views/pages/admin/role/RoleList")),
);
const RoleInsert = Loadable(
	lazy(() => import("../views/pages/admin/role/FormRolRegister")),
);
const UserRolInsert = Loadable(
	lazy(() => import("../views/pages/admin/role/FormAsignarRole")),
);

const ProductList = Loadable(
	lazy(() => import("../views/pages/admin/product/ProductsTable")),
);

const ProductInsert = Loadable(
	lazy(() => import("../views/pages/admin/product/ProductRegisterForm")),
);

const UserProfile = Loadable(
	lazy(() => import("../views/apps/user-profile/UserProfile")),
);

const MaritalList = Loadable(
	lazy(() => import("../views/pages/admin/maritals/MaritalTable")),
);

const Router = [
	{
		path: "/auth/reset-password",
		element: <ResetPasswordPage />,
	},
	{
		path: "/auth/reset-password/:token",
		element: <ResetPasswordPage />,
	},

	{
		path: "/",
		element: <FullLayout />,
		children: [
			{ path: "/", element: <Navigate to="/dashboards/modern" /> },

			{
				element: <Protected isRolUser={["Administrador", "Terapeuta"]} />,
				children: [
					// Dashboard
					{ path: "dashboards/modern", element: <ModernDash /> },
					{ path: "dashboards/ecommerce", element: <EcommerceDash /> },

					// Seguridad y administración
					{ path: "admin/Marital-Status", element: <MaritalList /> },

					{ path: "security/user/list", element: <UserList /> },
					{ path: "admin/users/create", element: <FormUser /> },

					{ path: "admin/persons/list", element: <PersonsList /> },
					{ path: "admin/persons/create", element: <FormPerson /> },

					{ path: "security/module", element: <ModuleList /> },
					{ path: "security/module/register", element: <FormModule /> },

					{ path: "security/menu", element: <MenuList /> },
					{ path: "security/menu/register", element: <MenuRegister /> },
					{ path: "security/menu-assignment", element: <FormAsignarMenuRol /> },

					{ path: "security/role", element: <RoleList /> },
					{ path: "security/role/register", element: <RoleInsert /> },
					{ path: "security/assignment-role", element: <UserRolInsert /> },

					{ path: "admin/products", element: <ProductList /> },
					{ path: "admin/products/register", element: <ProductInsert /> },

					{ path: "user-profile", element: <UserProfile /> },

					{ path: "admin/Person-Genre", element: <GenreTableList /> },

					{
						path: "/admin/promotions-product",
						element: <PromotionTableList />,
					},
					{
						path: "admin/expense/reports",
						element: <ExpenseReportPagination />,
					},

					{
						path: "/admin/expense/register",
						element: <FormExpenseRegister />,
					},

					{
						path: "/admin/expense/type",
						element: <ExpenseTypeList />,
					},
					{
						path: "/admin/persons",
						element: <PersonsList />,
					},
					{
						path: "Auditoria/commandsql",
						element: <AuditTableList />,
					},

					{
						path: "/admin/medicos",
						element: <PersonalMedical />,
					},
					{
						path: "/admin/medicos/type",
						element: <MedicPersonType />,
					},
					{
						path: "/admin/payment/method",
						element: <MethodPaymentTable />,
					},
					{
						path: "/admin/therapy/type",
						element: <TherapyTypeTable />,
					},
					{
						path: "/admin/therapy/type",
						element: <TherapyTypeTable />,
					},
					{
						path: "/clients",
						element: <ClientsPage />,
					},
					{
						path: "/pacients/list",
						element: <PatientPage />,
					},
					{
						path: "/clinic/patients/:patientId/diseases",
						element: <PatientDiseasePage />,
					},
					{
						path: "/clinic/patients/:patientId/allergy",
						element: <PatientAllergyPage />,
					},
					{
						path: "clinic/patients/:patientId/medical-history",
						element: <PatientMedicalHistoryPage />,
					},
					{
						path: "session/reports",
						element: <TherapySessionsByNurseReport />,
					},
					{
						path: "session/therapy",
						element: <SessionTablePage />,
					},
					{
						path: "tax",
						element: <TaxPage />,
					},
					{
						path: "disease/type",
						element: <DiseaseTypePage />,
					},
					{
						path: "disease/catalog",
						element: <DiseasePage />,
					},
					{
						path: "invoice",
						element: <InvoicePage />,
					},
					{
						path: "/invoice/:id/details/view",
						element: <InvoiceDataOverview />,
					},
				],
			},
		],
	},

	{
		path: "/",
		element: <BlankLayout />,
		children: [
			{ path: "auth/login", element: <Login /> },
			{ path: "auth/forgot-password", element: <ForgotPassword /> },
			{ path: "auth/404", element: <Error /> },
			{ path: "*", element: <Navigate to="/auth/404" /> },
		],
	},

	{ path: "*", element: <Navigate to="/auth/404" /> },
];

export default Router;
