import axios from "axios";
import Cookies from "js-cookie";

const BASE = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${BASE}/admin/persons`;

export const deletePersonById = async (id, user) => {
	try {
		const response = await axios.delete(
			`${API_BASE_URL}/delete/${id}/${user}`,
			{
				headers: {
					"Content-Type": "application/json",
					tokenapp: Cookies.get("token"),
				},
			},
		);
		return response.data;
	} catch (error) {
		if (error.response) {
			console.log("Error response data:", error.response.data);
			if (error.response.data?.result === true) {
				return error.response.data;
			}
		}
		throw error;
	}
};

export const createPerson = async (personData) => {
	try {
		const response = await axios.post(`${API_BASE_URL}/add`, personData, {
			headers: {
				"Content-Type": "application/json",
				tokenapp: Cookies.get("token"),
			},
		});
		return response.data;
	} catch (error) {
		if (error.response) {
			console.log("Error response data:", error.response.data);
			return error.response.data;
		}
		throw error;
	}
};

export async function editPerson(personData) {
	try {
		const response = await axios.patch(`${API_BASE_URL}/update`, personData, {
			headers: {
				tokenapp: Cookies.get("token"),
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error en editPerson:", error);
		throw error;
	}
}
