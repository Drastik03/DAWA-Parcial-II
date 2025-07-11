import axios from "axios";
import Cookies from "js-cookie";

const BASE = import.meta.env.VITE_API_URL;
const API_URL = `${BASE}/admin/payment_method`;

export const createPaymentMethod = async (payload) => {
	try {
		const response = await axios.post(`${API_URL}/insert`, payload, {
			headers: {
				tokenapp: Cookies.get("token"),
			},
		});
		return response.data;
	} catch (error) {
		return { result: false, message: error.message };
	}
};
