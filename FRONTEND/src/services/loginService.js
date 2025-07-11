import axios from "axios";
const BASE = import.meta.env.VITE_API_URL;

export async function loginAndSetHeader(data) {
	// eslint-disable-next-line no-useless-catch
	try {
		const response = await axios.post(`${BASE}/security/login`, data);
		const token = response.data.data.Token;
		console.log("Token recibido:", token);

		if (token && typeof token === "string" && token.trim() !== "") {
			axios.defaults.headers.common["tokenapp"] = `${token}`;
			console.log(
				"Authorization header set:",
				axios.defaults.headers.common["tokenapp"],
			);
		} else {
			console.warn("Token inválido, no se estableció el header Authorization.");
		}
		return response.data;
	} catch (error) {
		throw error;
	}
}
