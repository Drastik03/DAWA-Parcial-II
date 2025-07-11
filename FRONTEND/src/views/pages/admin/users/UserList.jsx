import { useFetch } from "../../../../hooks/useFetch";
import UserPaginationTable from "../../../tables/UserPaginationTable";

const UserList = () => {
	const { data, loading, error, refetch } = useFetch(
		`${import.meta.env.VITE_API_URL}/user/list`,
	);

	console.log("DESDE DATA USERS", data);

	// const headerRow = ["ID", "Person ID", "Login ID", "Email", "Acciones"];

	const headerRow = ["ID", "User", "Email", "Nombre completo", "Rol"];

	return (
		<main>
			<UserPaginationTable
				title="Usuario"
				header={headerRow}
				description="Listado de usuarios registradas"
				list={data}
				loading={loading}
				error={error}
				onRefresh={refetch}
			/>
		</main>
	);
};
export default UserList;
