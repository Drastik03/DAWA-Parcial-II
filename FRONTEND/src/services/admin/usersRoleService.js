import Cookie from "js-cookie";
import axios from "axios";

const API_URL = "http://localhost:5000/UserRol";

export async function asignarRole(payload) {
	try {
		const response = await axios.post(`${API_URL}/insert`, payload, {
			headers: {
				"Content-Type": "application/json",
				tokenapp: Cookie.get("token"),
			},
		});

		return response.data;
	} catch (error) {
		throw error;
	}
}
