import axios from "axios";
import Cookies from "js-cookie";

const BASE = import.meta.env.VITE_API_URL;
const API_URL = `${BASE}/Menu`;

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
