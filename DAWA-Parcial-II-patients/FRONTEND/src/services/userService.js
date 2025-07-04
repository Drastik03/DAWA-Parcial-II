import axios from "axios";
import Cookies from "js-cookie";

export async function deleteUser(id) {
	try {
		const response = await axios.patch(
			"http://localhost:5000/user/delete",
			{ del_id: id },
			{
				headers: {
					"Content-Type": "application/json",
					tokenapp: Cookies.get("token"),
				},
			},
		);
		return response.data;
	} catch (error) {
		console.error("Error al eliminar el usuario:", error);
		throw error;
	}
}
export async function createUser(userData) {
	try {
		const response = await axios.post(
			"http://localhost:5000/user/insert",
			userData,
			{
				headers: {
					"Content-Type": "application/json",
					tokenapp: Cookies.get("token"),
				},
			},
		);
		return response.data;
	} catch (error) {
		console.error("Error al crear el usuario:", error);
		throw error;
	}
}
