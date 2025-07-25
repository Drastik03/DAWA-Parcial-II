import axios from "axios";
import Cookies from "js-cookie";

const BASE = import.meta.env.VITE_API_URL;
const API_URL = `${BASE}/admin/expense`;

export const createExpense = async (payload) => {
	try {
		const response = await axios.post(`${API_URL}/insert`, payload, {
			headers: {
				"Content-Type": "application/json",
				tokenapp: Cookies.get("token"),
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error creando el gasto:", error);
		return {
			result: false,
			message: error.response?.data?.message || "Error al registrar el gasto",
		};
	}
};

export const updateExpense = async (payload) => {
	try {
		const response = await axios.patch(`${API_URL}/update`, payload, {
			headers: {
				"Content-Type": "application/json",
				tokenapp: Cookies.get("token"),
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error actualizando el gasto:", error);
		return {
			result: false,
			message: error.response?.data?.message || "Error al actualizar el gasto",
		};
	}
};
