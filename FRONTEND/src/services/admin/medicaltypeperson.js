import axios from "axios";
import Cookies from "js-cookie";

const API_BASE = "http://localhost:5000/";
export const updateMedicalPersonType = async (payload) => {
	try {
		const res = await axios.patch(
			`${API_BASE}admin/medicalPersonType/update`,
			payload,
			{
				headers: {
					tokenapp: Cookies.get("token"),
				},
			},
		);
		return res.data;
	} catch (error) {
		console.error("Error al actualizar tipo:", error);
		return {
			result: false,
			message: "Error al actualizar tipo",
		};
	}
};
