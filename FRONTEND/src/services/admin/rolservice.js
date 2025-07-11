import axios from "axios";
import Cookies from "js-cookie";

const BASE = import.meta.env.VITE_API_URL;
const API_URL = `${BASE}/RolSistem`;

export const createRole = async (roleData) => {
	try {
		const response = await axios.post(`${API_URL}/insert`, roleData, {
			headers: {
				tokenapp: Cookies.get("token"),
			},
		});
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const updateRole = async (roleData) => {
	try {
		const response = await axios.patch(`${API_URL}/update`, roleData, {
			headers: {
				tokenapp: Cookies.get("token"),
			},
		});
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};

export const deleteRole = async (data) => {
	try {
		const response = await axios.patch(
			`${API_URL}/delete`,
			{ del_id: data },
			{
				headers: {
					tokenapp: Cookies.get("token"),
				},
			},
		);
		return response.data;
	} catch (error) {
		throw error.response ? error.response.data : error;
	}
};
