import axios from "axios";
import Cookies from "js-cookie";
const API_URL = "http://localhost:5000/Menu";

export const insertMenu = async (data) => {
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

export const updateMenu = async (payload) => {
	try {
		const response = await axios.patch(`${API_URL}/update`, payload, {
			headers: {
				tokenapp: Cookies.get("token"),
			},
		});
		return response.data;
	} catch (error) {
		throw error;
	}
};

export const deleteMenu = async (del_id) => {
	try {
		const response = await axios.patch(
			`${API_URL}/delete`,
			{ del_id },
			{
				headers: {
					tokenapp: Cookies.get("token"),
				},
			},
		);
		return response.data;
	} catch (error) {
		throw error;
	}
};
