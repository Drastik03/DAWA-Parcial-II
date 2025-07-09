/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from "react";
import Cookies from "js-cookie";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth debe usarse dentro de un AuthProvider");
	}
	return context;
};

export const AuthProvider = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [token, setToken] = useState(() => Cookies.get("token") || null);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [loginId, setLoginId] = useState(null);
	const [role, setRole] = useState(null);
	const [menuRole, setMenuRole] = useState([]);

	const checkAuth = useCallback(async () => {
		setLoading(true);
		if (!token) {
			setIsAuthenticated(false);
			setUser(null);
			setRole(null);
			setLoginId(null);
			setMenuRole([]);
			setLoading(false);
			return;
		}
		try {
			const response = await axios.get(
				"http://localhost:5000/user/actulization/data",
				{
					headers: { tokenapp: token },
				},
			);
			const data = response.data.data;

			setUser(data);
			setRole(data.rols?.[0] || null);
			setLoginId(data.user?.slo_id || null);
			setMenuRole(data.rols || []);
			setIsAuthenticated(true);
		} catch (error) {
			console.error("Error al validar el token:", error);
			setIsAuthenticated(false);
			setUser(null);
			setRole(null);
			setLoginId(null);
			setMenuRole([]);
		} finally {
			setLoading(false);
		}
	}, [token]);

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	const login = useCallback((tokenValue) => {
		Cookies.set("token", tokenValue, {
			secure: true,
			sameSite: "Strict",
			path: "/",
			expires: 15 / (24 * 60),
		});
		setToken(tokenValue);
		setIsAuthenticated(true);
	}, []);

	const logout = useCallback(() => {
		Cookies.remove("token");
		setToken(null);
		setUser(null);
		setIsAuthenticated(false);
		setRole(null);
		setLoginId(null);
		setMenuRole([]);
	}, []);

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated,
				token,
				login,
				logout,
				user,
				setUser,
				role,
				loginId,
				setLoginId,
				setRole,
				loading,
				menuRole,
				setMenuRole,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
