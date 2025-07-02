import { useFetch } from "../../../../hooks/useFetch";

import RolePaginationTable from "../../../tables/RolePaginationTable";

const RoleList = () => {
	const { data, loading, error, refetch } = useFetch(
		"http://localhost:5000/RolSistem/list",
	);
	console.log("DESDE DATA ROLES", data);

	const headerRow = ["ID", "Nombre", "Descripción"];



	return (
		<main>
			<RolePaginationTable
				list={data}
				loading={loading}
				error={error}
				header={headerRow}
				onRefresh={refetch}
			/>
		</main>
	);
};

export default RoleList;
