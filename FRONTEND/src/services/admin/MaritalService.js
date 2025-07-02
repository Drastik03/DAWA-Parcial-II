import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "http://localhost:5000/admin/Marital_status";

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
