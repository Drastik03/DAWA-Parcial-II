import axios from "axios";
import Cookies from "js-cookie";
const API_URL = "http://localhost:5000/Module";

export async function createModule(moduleData) {
	try {
		const response = await axios.post(`${API_URL}/insert`, moduleData, {
			headers: {
				tokenapp: Cookies.get("token"),
			},
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function updateModule(data) {
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
}

export async function deleteModule(id) {
	try {
		const response = await axios.patch(
			`${API_URL}/delete`,
			{ del_id: id },
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
}
