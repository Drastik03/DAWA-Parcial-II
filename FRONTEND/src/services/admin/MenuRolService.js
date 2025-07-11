import axios from "axios";
import Cookies from "js-cookie";

const BASE = import.meta.env.VITE_API_URL;
const API_URL = `${BASE}/MenuRol`;

export const insertMenuRol = async (data) => {
	try {
		const response = await axios.post(`${API_URL}/insert`, data, {
			headers: {
				tokenapp: Cookies.get("token"),
			},
		});
		return response.data;
	} catch (error) {
		throw error;
	}
};
