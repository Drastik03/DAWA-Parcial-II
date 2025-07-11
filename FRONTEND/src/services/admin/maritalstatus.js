import axios from "axios";
import Cookies from "js-cookie";

const BASE = import.meta.env.VITE_API_URL;
const API_URL = `${BASE}/admin/Marital_status`;

export const deleteMarital = async (id, user) => {
	try {
		const response = await axios.delete(`${API_URL}/delete/${id}/${user}`, {
			headers: {
				tokenapp: Cookies.get("token"),
			},
		});
		return response.data;
	} catch (error) {
		throw error;
	}
};

export const updateMarital = async (data) => {
	try {
		const response = await axios.patch(`${API_URL}/update`, data, {
			headers: {
				tokenapp: Cookies.get("token"),
			},
		});
		return response.data;
	} catch (error) {
		throw error;
	}
};

export const createMarital = async (payload) => {
	try {
		const response = await axios.post(`${API_URL}/add`, payload, {
			headers: {
				tokenapp: Cookies.get("token"),
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error creando estado civil:", error);
		return {
			result: false,
			message: "Error en la conexión con el servidor.",
		};
	}
};
