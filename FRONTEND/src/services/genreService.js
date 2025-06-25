import axios from "axios";

const API_URL = "http://localhost:5000/admin/Person_genre/list";

export const getGenres = async () => {
	try {
		const response = await axios.get(API_URL);
		if (response.status !== 200) {
			throw new Error("Failed to fetch genres");
		}
		return response.data;
	} catch (error) {
		throw error;
	}
};
