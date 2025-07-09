import axios from "axios";
import Cookies from "js-cookie";
const API_BASE = "http://localhost:5000/";
export const createPersonalMedical = async (payload) => {
	try {
		const response = await axios.post(
			`${API_BASE}/admin/Medical_staff/add`,
			payload,
			{
				headers: {
					tokenapp: Cookies.get("token"),
				},
			},
		);
		return response.data;
	} catch (error) {
		console.error("Error al crear personal médico:", error);
		return {
			result: false,
			message: "Error al crear personal médico",
			data: {},
			status_code: 500,
		};
	}
};

export const updatePersonalMedical = async (med_id, payload) => {
	try {
		const response = await axios.patch(
			`http://localhost:5000/admin/Medical_staff/update/${med_id}`,
			payload,
			{
				headers: {
					"Content-Type": "application/json",
					tokenapp: Cookies.get("token"),
				},
			},
		);
		return response.data;
	} catch (error) {
		console.error("Error al actualizar personal médico:", error);
		return {
			result: false,
			message: "Error al actualizar personal médico",
			data: {},
			status_code: 500,
		};
	}
};

export const deletePersonalMedical = async (med_id, userDeleted) => {
	try {
		const response = await axios.delete(
			`${API_BASE}admin/Medical_staff/delete/${med_id}`,
			{
				data: { user_deleted: userDeleted },
				headers: {
					tokenapp: Cookies.get("token"),
				},
			},
		);
		return response.data;
	} catch (error) {
		console.error(
			"Error al eliminar personal médico:",
			error.response || error,
		);
		return {
			result: false,
			message: "Error al eliminar personal médico",
			data: {},
			status_code: 500,
		};
	}
};
