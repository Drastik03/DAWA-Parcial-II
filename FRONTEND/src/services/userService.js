import axios from "axios";
import Cookies from "js-cookie";

const BASE = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${BASE}/user`;

export async function deleteUser(id) {
	try {
		const response = await axios.patch(
			`${API_BASE_URL}/delete`,
			{ del_id: id },
			{
				headers: {
					"Content-Type": "application/json",
					tokenapp: Cookies.get("token"),
				},
			},
		);
		return response.data;
	} catch (error) {
		console.error("Error al eliminar el usuario:", error);
		throw error;
	}
}

export async function createUser(userData) {
	try {
		const response = await axios.post(`${API_BASE_URL}/insert`, userData, {
			headers: {
				"Content-Type": "application/json",
				tokenapp: Cookies.get("token"),
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error al crear el usuario:", error);
		throw error;
	}
}
