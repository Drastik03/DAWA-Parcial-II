import React, { useState, useMemo } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Button,
	TextField,
	Box,
	TablePagination,
} from "@mui/material";
import { useFetch } from "../../../../hooks/useFetch";

export const ClientsTable = ({ onSelectClient }) => {
	const { data, loading } = useFetch("http://localhost:5000/admin/client/list");
	const clients = Array.isArray(data?.data) ? data?.data : [];

	const [search, setSearch] = useState("");
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	const filteredClients = useMemo(() => {
		const lowerSearch = search.toLowerCase();
		return clients.filter((client) =>
			`${client.cli_name} ${client.cli_identification}`
				.toLowerCase()
				.includes(lowerSearch),
		);
	}, [clients, search]);

	const paginatedClients = useMemo(() => {
		const start = page * rowsPerPage;
		return filteredClients.slice(start, start + rowsPerPage);
	}, [filteredClients, page, rowsPerPage]);

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	if (loading) return <div>Cargando clientes...</div>;

	return (
		<Box sx={{ mt: 2 }}>
			<TextField
				label="Buscar por nombre o identificación"
				variant="outlined"
				size="small"
				fullWidth
				value={search}
				onChange={(e) => {
					setSearch(e.target.value);
					setPage(0);
				}}
				sx={{ mb: 2 }}
			/>

			<TableContainer component={Paper} elevation={3}>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>ID</TableCell>
							<TableCell>Nombre</TableCell>
							<TableCell>Identificación</TableCell>
							<TableCell>Correo</TableCell>
							<TableCell>Acción</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{paginatedClients.length > 0 ? (
							paginatedClients.map((client) => (
								<TableRow key={client.cli_id} hover>
									<TableCell>{client.cli_id}</TableCell>
									<TableCell>{client.cli_name}</TableCell>
									<TableCell>{client.cli_identification}</TableCell>
									<TableCell>{client.cli_mail_bill}</TableCell>
									<TableCell>
										<Button
											variant="outlined"
											size="small"
											onClick={() => onSelectClient(client)}
										>
											Seleccionar
										</Button>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={5} align="center">
									No se encontraron clientes.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>

				<TablePagination
					component="div"
					count={filteredClients.length}
					page={page}
					onPageChange={handleChangePage}
					rowsPerPage={rowsPerPage}
					onRowsPerPageChange={handleChangeRowsPerPage}
					rowsPerPageOptions={[5, 10, 25]}
					labelRowsPerPage="Filas por página"
				/>
			</TableContainer>
		</Box>
	);
};
