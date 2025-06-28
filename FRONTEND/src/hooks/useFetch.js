import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";

export const useFetch = (url, autoFetch = true) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchApi = useCallback(async () => {
		try {
			setLoading(true);
			const response = await axios.get(url, {
				headers: {
					"Content-Type": "application/json",
					tokenapp: Cookies.get("token"),
				},
			});
			setData(response.data?.data || []);
			setError(null);
		} catch (error) {
			setError(error);
			setData(null);
		} finally {
			setLoading(false);
		}
	}, [url]);

	useEffect(() => {
		if (autoFetch) {
			fetchApi();
		}
	}, [autoFetch, fetchApi]);

	return {
		data,
		loading,
		error,
		refetch: fetchApi,
	};
};
