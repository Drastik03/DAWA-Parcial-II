import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "http://localhost:5000/admin/ExpenseType";

export const createExpenseType = async (payload) => {
	try {
		const response = await axios.post(`${API_URL}/insert`, payload, {
			headers: {
				"Content-Type": "application/json",
				tokenapp: Cookies.get("token"),
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error creando el tipo de gasto:", error);
		return {
			result: false,
			message:
				error.response?.data?.message || "Error al registrar tipo de gasto",
		};
	}
};

export const updateExpenseType = async (payload) => {
	try {
		const response = await axios.patch(`${API_URL}/update`, payload, {
			headers: {
				"Content-Type": "application/json",
				tokenapp: Cookies.get("token"),
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error actualizando el tipo de gasto:", error);
		return {
			result: false,
			message:
				error.response?.data?.message || "Error al actualizar tipo de gasto",
		};
	}
};

export const deleteExpenseType = async (ext_id) => {
	try {
		const response = await axios.delete(`${API_URL}/delete/${ext_id}`, {
			headers: {
				tokenapp: Cookies.get("token"),
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error eliminando el tipo de gasto:", error);
		return {
			result: false,
			message:
				error.response?.data?.message || "Error al eliminar tipo de gasto",
		};
	}
};
