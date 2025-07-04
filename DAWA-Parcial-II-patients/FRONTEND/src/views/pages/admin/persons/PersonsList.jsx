import { useFetch } from "../../../../hooks/useFetch";
import PersonPaginationTable from "../../../tables/PersonPaginationTable";

const PersonsList = () => {
	const { data, loading, error, refetch } = useFetch(
		"http://localhost:5000/admin/persons/list",
	);

	const headerRow = [
		"ID",
		"CI",
		"Nombres",
		"Apellidos",
		"Genero",
		"Estado Civil",
		"Email",
		"Fecha de Nacimiento",
	];

	return (
		<main>
			<PersonPaginationTable
				title="Personas"
				description="Listado de personas registradas"
				list={data}
				loading={loading}
				error={error}
				header={headerRow}
				onRefresh={refetch}
			/>
		</main>
	);
};

export default PersonsList;
