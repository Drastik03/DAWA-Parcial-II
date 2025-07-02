import axios from "axios";
import Cookies from "js-cookie"

const API_URL = "http://localhost:5000/MenuRol";

export const insertMenuRol = async (data) => {
	try {
		const response = await axios.post(`${API_URL}/insert`,data,{
            headers:{
                tokenapp: Cookies.get("token")
            }
        } );
		return response.data;
	} catch (error) {
		throw error;
	}
};
