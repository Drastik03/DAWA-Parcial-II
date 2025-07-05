import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = "http://localhost:5000/admin/Person_genre";

export const editGenre = async (genreData) => {
	try {
		const response = await axios.patch(`${BASE_URL}/update`, genreData, {
			headers: {
				tokenapp: Cookies.get("token"),
			},
		});
		if (response.status !== 200) {
			throw new Error("Failed to edit genre");
		}
		return response.data;
	} catch (error) {
		throw error;
	}
};

export const deleteGenre = async (id, user) => {
	try {
		const response = await axios.delete(`${BASE_URL}/delete/${id}/${user}`, {
			headers: {
				tokenapp: Cookies.get("token"),
			},
		});
		if (response.status !== 200) {
			throw new Error("Failed to delete genre");
		}
		return response.data;
	} catch (error) {
		throw error;
	}
};

export const createGenre = async (payload) => {
	try {
		const response = await axios.post(`${BASE_URL}/add`, payload, {
			headers: {
				tokenapp: Cookies.get("token"),
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error creando género:", error);
		return {
			result: false,
			message: "Error en la conexión con el servidor.",
		};
	}
};
