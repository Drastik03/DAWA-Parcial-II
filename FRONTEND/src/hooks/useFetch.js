import axios from "axios";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export const useFetch = (url, autoFetch = true) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchApi = async () => {
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
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (autoFetch) {
			fetchApi();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [url]);

	return {
		data,
		loading,
		error,
		refetch: fetchApi,
	};
};
