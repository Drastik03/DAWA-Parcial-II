import axios from "axios";
import Cookies from "js-cookie";

export const createExpense = async (payload) => {
	try {
		const response = await axios.post(`${API_URL}/create`, payload, {
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
