import axios from "axios";
import Cookies from "js-cookie";

const BASE = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${BASE}/admin/promotion`;

const getAuthHeaders = () => ({
	headers: {
		tokenapp: Cookies.get("token"),
	},
});

export const insertPromotion = async (promotionData) => {
	const response = await axios.post(
		`${API_BASE_URL}/insert`,
		promotionData,
		getAuthHeaders(),
	);
	return response.data;
};

export const updatePromotion = async (promotionData) => {
	const response = await axios.patch(
		`${API_BASE_URL}/update`,
		promotionData,
		getAuthHeaders(),
	);
	return response.data;
};

export const deletePromotion = async (pro_id) => {
	const response = await axios.delete(
		`${API_BASE_URL}/delete/${pro_id}`,
		getAuthHeaders(),
	);
	return response.data;
};

export const createPromotion = async (data) => {
	const response = await axios.post(
		`${API_BASE_URL}/insert`,
		data,
		getAuthHeaders(),
	);
	return response.data;
};
