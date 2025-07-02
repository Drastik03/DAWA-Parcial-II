import { Box } from "@mui/system";
import { useAuth } from "../../context/AuthContext";
import { Navigate, Outlet } from "react-router";
import Spinner from "../../views/spinner/Spinner";

export const Protected = ({ isRolUser }) => {
	const { isAuthenticated, user, loading } = useAuth();

	if (loading) {
		return (
			<Box
				className="w-full h-full p-6 flex flex-col"
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Spinner />
			</Box>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/auth/login" replace />
	}

	const rolesDelUsuario = user?.rols?.map((r) => r.rol_name) || [];
	const tieneRolPermitido = isRolUser.some((rol) =>
		rolesDelUsuario.includes(rol),
	);

	if (!tieneRolPermitido) return <Navigate to="/auth/404" replace />;

	return <Outlet />;
};
