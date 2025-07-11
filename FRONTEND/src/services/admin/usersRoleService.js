import Cookies from "js-cookie";
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL;
const API_URL = `${BASE}/UserRol`;

export async function asignarRole(payload) {
	try {
		const response = await axios.post(`${API_URL}/insert`, payload, {
			headers: {
				"Content-Type": "application/json",
				tokenapp: Cookies.get("token"),
			},
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}
