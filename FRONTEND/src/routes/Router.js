import { lazy } from "react";
import { Navigate } from "react-router-dom";

import Loadable from "../layouts/full/shared/loadable/Loadable";
import { Protected } from "../components/auth/Protected";
import ResetPasswordPage from "../views/authentication/auth1/RecoverPassword";
import { UserList } from "../views/pages/admin/users/UserList";

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import("../layouts/full/FullLayout")));
const BlankLayout = Loadable(
	lazy(() => import("../layouts/blank/BlankLayout")),
);

/* ****Pages***** */
const ModernDash = Loadable(lazy(() => import("../views/dashboard/Modern")));
const EcommerceDash = Loadable(
	lazy(() => import("../views/dashboard/Ecommerce")),
);
const PersonsList = Loadable(
	lazy(() => import(`../views/pages/admin/persons/PersonsList`)),
);

const FormUser = Loadable(
	lazy(() => import(`../views/pages/admin/users/FormUserRegister`)),
);

/* ****Apps***** */

const UserProfile = Loadable(
	lazy(() => import("../views/apps/user-profile/UserProfile")),
);

// Pages
const FormPerson = Loadable(
	lazy(() => import("../views/pages/admin/persons/FormLoginPerson")),
);
const RollbaseCASL = Loadable(
	lazy(() => import("../views/pages/rollbaseCASL/RollbaseCASL")),
);
const Treeview = Loadable(
	lazy(() => import("../views/pages/treeview/Treeview")),
);
const AccountSetting = Loadable(
	lazy(() => import("../views/pages/account-setting/AccountSetting")),
);

// widget
const WidgetCards = Loadable(
	lazy(() => import("../views/widgets/cards/WidgetCards")),
);
const WidgetBanners = Loadable(
	lazy(() => import("../views/widgets/banners/WidgetBanners")),
);
const WidgetCharts = Loadable(
	lazy(() => import("../views/widgets/charts/WidgetCharts")),
);

// form elements
const MuiAutoComplete = Loadable(
	lazy(() => import("../views/forms/form-elements/MuiAutoComplete")),
);
const MuiButton = Loadable(
	lazy(() => import("../views/forms/form-elements/MuiButton")),
);
const MuiCheckbox = Loadable(
	lazy(() => import("../views/forms/form-elements/MuiCheckbox")),
);
const MuiRadio = Loadable(
	lazy(() => import("../views/forms/form-elements/MuiRadio")),
);
const MuiSlider = Loadable(
	lazy(() => import("../views/forms/form-elements/MuiSlider")),
);
const MuiDateTime = Loadable(
	lazy(() => import("../views/forms/form-elements/MuiDateTime")),
);
const MuiSwitch = Loadable(
	lazy(() => import("../views/forms/form-elements/MuiSwitch")),
);

// form layout
const FormLayouts = Loadable(lazy(() => import("../views/forms/FormLayouts")));
const FormCustom = Loadable(lazy(() => import("../views/forms/FormCustom")));
const FormWizard = Loadable(lazy(() => import("../views/forms/FormWizard")));
const FormValidation = Loadable(
	lazy(() => import("../views/forms/FormValidation")),
);
const QuillEditor = Loadable(
	lazy(() => import("../views/forms/quill-editor/QuillEditor")),
);
const FormHorizontal = Loadable(
	lazy(() => import("../views/forms/FormHorizontal")),
);
const FormVertical = Loadable(
	lazy(() => import("../views/forms/FormVertical")),
);

// tables
const BasicTable = Loadable(lazy(() => import("../views/tables/BasicTable")));
const CollapsibleTable = Loadable(
	lazy(() => import("../views/tables/CollapsibleTable")),
);
const EnhancedTable = Loadable(
	lazy(() => import("../views/tables/EnhancedTable")),
);
const FixedHeaderTable = Loadable(
	lazy(() => import("../views/tables/FixedHeaderTable")),
);
const PaginationTable = Loadable(
	lazy(() => import("../views/tables/PersonPaginationTable")),
);
const SearchTable = Loadable(lazy(() => import("../views/tables/SearchTable")));

// chart
const LineChart = Loadable(lazy(() => import("../views/charts/LineChart")));
const GredientChart = Loadable(
	lazy(() => import("../views/charts/GredientChart")),
);
const DoughnutChart = Loadable(
	lazy(() => import("../views/charts/DoughnutChart")),
);
const AreaChart = Loadable(lazy(() => import("../views/charts/AreaChart")));
const ColumnChart = Loadable(lazy(() => import("../views/charts/ColumnChart")));
const CandlestickChart = Loadable(
	lazy(() => import("../views/charts/CandlestickChart")),
);
const RadialbarChart = Loadable(
	lazy(() => import("../views/charts/RadialbarChart")),
);

// ui
const MuiAlert = Loadable(
	lazy(() => import("../views/ui-components/MuiAlert")),
);
const MuiAccordion = Loadable(
	lazy(() => import("../views/ui-components/MuiAccordion")),
);
const MuiAvatar = Loadable(
	lazy(() => import("../views/ui-components/MuiAvatar")),
);
const MuiChip = Loadable(lazy(() => import("../views/ui-components/MuiChip")));
const MuiDialog = Loadable(
	lazy(() => import("../views/ui-components/MuiDialog")),
);
const MuiList = Loadable(lazy(() => import("../views/ui-components/MuiList")));
const MuiPopover = Loadable(
	lazy(() => import("../views/ui-components/MuiPopover")),
);
const MuiRating = Loadable(
	lazy(() => import("../views/ui-components/MuiRating")),
);
const MuiTabs = Loadable(lazy(() => import("../views/ui-components/MuiTabs")));
const MuiTooltip = Loadable(
	lazy(() => import("../views/ui-components/MuiTooltip")),
);
const MuiTransferList = Loadable(
	lazy(() => import("../views/ui-components/MuiTransferList")),
);
const MuiTypography = Loadable(
	lazy(() => import("../views/ui-components/MuiTypography")),
);

// authentication
const Login = Loadable(
	lazy(() => import("../views/authentication/auth1/Login")),
);
const Login2 = Loadable(
	lazy(() => import("../views/authentication/auth2/Login2")),
);
const Register = Loadable(
	lazy(() => import("../views/authentication/auth1/Register")),
);
const Register2 = Loadable(
	lazy(() => import("../views/authentication/auth2/Register2")),
);
const ForgotPassword = Loadable(
	lazy(() => import("../views/authentication/auth1/ForgotPassword")),
);
const ForgotPassword2 = Loadable(
	lazy(() => import("../views/authentication/auth2/ForgotPassword2")),
);
const TwoSteps = Loadable(
	lazy(() => import("../views/authentication/auth1/TwoSteps")),
);
const TwoSteps2 = Loadable(
	lazy(() => import("../views/authentication/auth2/TwoSteps2")),
);
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
const Error = Loadable(lazy(() => import("../views/authentication/Error")));
const Maintenance = Loadable(
	lazy(() => import("../views/authentication/Maintenance")),
);

// landingpage
const Landingpage = Loadable(
	lazy(() => import("../views/pages/landingpage/Landingpage")),
);

const Router = [
	{
		path: "/",
		element: <FullLayout />,

		children: [
			{ path: "/", element: <Navigate to="/auth/login" /> },
			{
				path: "/auth/reset-password",
				element: <Navigate to="/auth/login" />, 
			},
			{
				path: "/auth/reset-password/:token",
				element: <ResetPasswordPage />,
			},

			{
				element: <Protected isRolUser={["Administrador"]} />,
				children: [
					{ path: "/admin/users/list", element: <UserList /> },
					{ path: "/admin/users/create", element: <FormUser /> },

					{ path: "/admin/persons/list", element: <PersonsList /> },
					{ path: "/admin/persons/create", element: <FormPerson /> },

					{ path: "/dashboards/modern", exact: true, element: <ModernDash /> },
					{
						path: "/dashboards/ecommerce",
						exact: true,
						element: <EcommerceDash />,
					},
				],
			},

			{ path: "/user-profile", element: <UserProfile /> },
			{ path: "/pages/casl", element: <RollbaseCASL /> },
			{ path: "/pages/treeview", element: <Treeview /> },
			{ path: "/pages/account-settings", element: <AccountSetting /> },
			{
				path: "/forms/form-elements/autocomplete",
				element: <MuiAutoComplete />,
			},
			{ path: "/forms/form-elements/button", element: <MuiButton /> },
			{ path: "/forms/form-elements/checkbox", element: <MuiCheckbox /> },
			{ path: "/forms/form-elements/radio", element: <MuiRadio /> },
			{ path: "/forms/form-elements/slider", element: <MuiSlider /> },
			{ path: "/forms/form-elements/date-time", element: <MuiDateTime /> },
			{ path: "/forms/form-elements/switch", element: <MuiSwitch /> },
			{ path: "/forms/form-elements/switch", element: <MuiSwitch /> },
			{ path: "/forms/quill-editor", element: <QuillEditor /> },
			{ path: "/forms/form-layouts", element: <FormLayouts /> },
			{ path: "/forms/form-horizontal", element: <FormHorizontal /> },
			{ path: "/forms/form-vertical", element: <FormVertical /> },
			{ path: "/forms/form-custom", element: <FormCustom /> },
			{ path: "/forms/form-wizard", element: <FormWizard /> },
			{ path: "/forms/form-validation", element: <FormValidation /> },
			{ path: "/tables/basic", element: <BasicTable /> },
			{ path: "/tables/collapsible", element: <CollapsibleTable /> },
			{ path: "/tables/enhanced", element: <EnhancedTable /> },
			{ path: "/tables/fixed-header", element: <FixedHeaderTable /> },
			{ path: "/tables/pagination", element: <PaginationTable /> },
			{ path: "/tables/search", element: <SearchTable /> },
			{ path: "/charts/line-chart", element: <LineChart /> },
			{ path: "/charts/gredient-chart", element: <GredientChart /> },
			{ path: "/charts/doughnut-pie-chart", element: <DoughnutChart /> },
			{ path: "/charts/area-chart", element: <AreaChart /> },
			{ path: "/charts/column-chart", element: <ColumnChart /> },
			{ path: "/charts/candlestick-chart", element: <CandlestickChart /> },
			{ path: "/charts/radialbar-chart", element: <RadialbarChart /> },
			{ path: "/ui-components/alert", element: <MuiAlert /> },
			{ path: "/ui-components/accordion", element: <MuiAccordion /> },
			{ path: "/ui-components/avatar", element: <MuiAvatar /> },
			{ path: "/ui-components/chip", element: <MuiChip /> },
			{ path: "/ui-components/dialog", element: <MuiDialog /> },
			{ path: "/ui-components/list", element: <MuiList /> },
			{ path: "/ui-components/popover", element: <MuiPopover /> },
			{ path: "/ui-components/rating", element: <MuiRating /> },
			{ path: "/ui-components/tabs", element: <MuiTabs /> },
			{ path: "/ui-components/tooltip", element: <MuiTooltip /> },
			{ path: "/ui-components/transfer-list", element: <MuiTransferList /> },
			{ path: "/ui-components/typography", element: <MuiTypography /> },
			{ path: "/widgets/cards", element: <WidgetCards /> },
			{ path: "/widgets/banners", element: <WidgetBanners /> },
			{ path: "/widgets/charts", element: <WidgetCharts /> },

			{ path: "*", element: <Navigate to="/auth/404" /> },
		],
	},
	{
		path: "/",
		element: <BlankLayout />,
		children: [
			{ path: "/auth/404", element: <Error /> },
			{ path: "/auth/login", element: <Login /> },
			{ path: "/auth/login2", element: <Login2 /> },
			{ path: "/auth/register", element: <Register /> },
			{ path: "/auth/register2", element: <Register2 /> },
			{ path: "/auth/forgot-password", element: <ForgotPassword /> },
			{ path: "/auth/forgot-password2", element: <ForgotPassword2 /> },
			{ path: "/auth/two-steps", element: <TwoSteps /> },
			{ path: "/auth/two-steps2", element: <TwoSteps2 /> },
			{ path: "/auth/maintenance", element: <Maintenance /> },
			{ path: "/landingpage", element: <Landingpage /> },
			{ path: "*", element: <Navigate to="/auth/404" /> },
		],
	},
];

export default Router;
