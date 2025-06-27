/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from "react";
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
	const [token, setToken] = useState(null);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [loginId, setLoginId] = useState(null);
	const [role, setRole] = useState(null);

	useEffect(() => {
		console.log(loginId);
	});
	useEffect(() => {
		async function checkAuth() {
			setLoading(true);
			const storedToken = Cookies.get("token");
			if (storedToken) {
				setToken(storedToken);
				setIsAuthenticated(true);
				try {
					const response = await axios.get(
						"http://localhost:5000/user/actulization/data",
						{
							headers: { tokenapp: `${storedToken}` },
						},
					);
					setUser(response.data.data);
					setRole(response.data.data.rols[0]);
					setLoginId(response.data.data.user.slo_id);
				} catch (error) {
					console.error("Error al validar el token:", error);
					setIsAuthenticated(false);
					setUser(null);
				} finally {
					setLoading(false);
				}
			} else {
				setIsAuthenticated(false);
				setUser(null);
				setLoading(false);
			}
		}
		checkAuth();
	}, []);

	const login = (tokenValue) => {
		Cookies.set("token", tokenValue, {
			secure: true,
			sameSite: "Strict",
			path: "/",
			expires: 15 / (24 * 60),
		});
		setToken(tokenValue);
		setIsAuthenticated(true);
	};

	const logout = () => {
		Cookies.remove("token");
		setToken(null);
		setUser(null);
		setIsAuthenticated(false);
	};

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
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
