import axios from "axios";
import Cookies from "js-cookie";

const BASE = import.meta.env.VITE_API_URL;
const API_URL = `${BASE}/admin/product`;

export const createProduct = async (formData) => {
	try {
		const response = await axios.post(`${API_URL}/insert`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
				tokenapp: Cookies.get("token"),
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error al crear producto:", error);
		if (error.response && error.response.data) {
			return error.response.data;
		}
		return { result: false, message: "Error desconocido al crear producto" };
	}
};

export const deleteProduct = async (pro_id) => {
	try {
		const response = await axios.delete(`${API_URL}/delete/${pro_id}`, {
			headers: {
				tokenapp: Cookies.get("token"),
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error al eliminar producto:", error);
		if (error.response && error.response.data) {
			return error.response.data;
		}
		return { result: false, message: "Error desconocido al eliminar producto" };
	}
};

export const editProductData = async (formData) => {
	try {
		const response = await axios.patch(`${API_URL}/update`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
				tokenapp: Cookies.get("token"),
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error al editar producto:", error);
		if (error.response && error.response.data) {
			return error.response.data;
		}
		return { result: false, message: "Error desconocido al editar producto" };
	}
};
