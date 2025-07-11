import axios from "axios";
import Cookies from "js-cookie";

const BASE = import.meta.env.VITE_API_URL;
const RESOURCE = "/admin/Person_genre";

const authHeader = () => ({
	headers: {
		tokenapp: Cookies.get("token"),
	},
});

export const editGenre = async (genreData) => {
	try {
		const response = await axios.patch(
			`${BASE}${RESOURCE}/update`,
			genreData,
			authHeader(),
		);
		if (response.status !== 200) {
			throw new Error("Fallo al editar el género");
		}
		return response.data;
	} catch (error) {
		throw error;
	}
};

export const deleteGenre = async (id, user) => {
	try {
		const response = await axios.delete(
			`${BASE}${RESOURCE}/delete/${id}/${user}`,
			authHeader(),
		);
		if (response.status !== 200) {
			throw new Error("Fallo al eliminar el género");
		}
		return response.data;
	} catch (error) {
		throw error;
	}
};

export const createGenre = async (payload) => {
	try {
		const response = await axios.post(
			`${BASE}${RESOURCE}/add`,
			payload,
			authHeader(),
		);
		return response.data;
	} catch (error) {
		return {
			result: false,
			message: "Error en la conexión con el servidor.",
		};
	}
};
