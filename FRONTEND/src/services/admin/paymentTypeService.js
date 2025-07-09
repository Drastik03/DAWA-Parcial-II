import axios from "axios";
import Cookies from "js-cookie";
export const createPaymentMethod = async (payload) => {
	try {
		const response = await axios.post(
			"http://localhost:5000/admin/payment_method/insert",
			payload,
			{
				headers: {
					tokenapp: Cookies.get("token"),
				},
			},
		);
		return response.data;
	} catch (error) {
		return { result: false, message: error.message };
	}
};
