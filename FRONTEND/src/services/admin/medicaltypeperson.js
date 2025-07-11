import axios from "axios";
import Cookies from "js-cookie";

const BASE = import.meta.env.VITE_API_URL;
const API_BASE = `${BASE}/admin/medicalPersonType`;

export const updateMedicalPersonType = async (payload) => {
	try {
		const res = await axios.patch(`${API_BASE}/update`, payload, {
			headers: {
				tokenapp: Cookies.get("token"),
			},
		});
		return res.data;
	} catch (error) {
		console.error("Error al actualizar tipo:", error);
		return {
			result: false,
			message: "Error al actualizar tipo",
		};
	}
};
