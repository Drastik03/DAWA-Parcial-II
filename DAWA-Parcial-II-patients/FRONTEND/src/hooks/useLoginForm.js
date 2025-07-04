import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { loginAndSetHeader } from "../services/loginService";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const useLoginForm = () => {
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm();
	const [errorMsg, setErrorMsg] = useState("");
	const { setLoginId, login, setUser, setRole } = useAuth();

	const navigate = useNavigate();

	const onSubmit = async (formData) => {
		try {
			const body = {
				...formData,
				// host_name: window.location.hostname || "",
				host_name: window.location.hostname,
			};

			const response = await loginAndSetHeader(body);

			if (response?.data?.Token && response?.data?.Datos) {
				console.log("Usuario autenticado:", response.data.Datos);
				login(response.data.Token);
				setRole(response.data.Datos.rols[0]);
				setUser(response.data.Datos);
				setLoginId(response.data.LogId);
				navigate("/dashboards/modern");
			} else {
				console.error("Respuesta inesperada:", response);
			}
		} catch (err) {
			console.error("Error al hacer login:", err);
			setErrorMsg(err.response.data.message);

		}
	};

	return {
		register,
		handleSubmit,
		errorMsg,
		errors,
		onSubmit,
	};
};
