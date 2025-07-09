import React, { useState, useMemo, useCallback } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	TextField,
	Button,
	Box,
	Stack,
	Snackbar,
	Alert,
	TablePagination,
} from "@mui/material";
import { useFetch } from "../../../../hooks/useFetch";

export const PersonsTable = ({ onSelectPerson }) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [alert, setAlert] = useState({
		open: false,
		message: "",
		severity: "success",
	});

	const { data, loading, error, refetch } = useFetch(
		"http://localhost:5000/admin/persons/list",
	);

	const persons = Array.isArray(data?.data) ? data.data : [];

	const filteredPersons = useMemo(() => {
		const term = searchTerm.toLowerCase().trim();
		if (!term) return persons;
		return persons.filter(
			(person) =>
				person.per_names.toLowerCase().includes(term) ||
				person.per_surnames.toLowerCase().includes(term) ||
				person.per_identification.includes(term),
		);
	}, [persons, searchTerm]);

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	const paginatedPersons = useMemo(() => {
		const start = page * rowsPerPage;
		return filteredPersons.slice(start, start + rowsPerPage);
	}, [filteredPersons, page, rowsPerPage]);

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleSearchChange = useCallback((e) => {
		setSearchTerm(e.target.value);
		setPage(0);
	}, []);

	const handleCloseAlert = useCallback(() => {
		setAlert((prev) => ({ ...prev, open: false }));
	}, []);

	const handleRetry = () => {
		refetch();
		setAlert({
			open: true,
			message: "Reintentando cargar personas...",
			severity: "info",
		});
	};

	if (loading)
		return (
			<Box mt={4} textAlign="center">
				Cargando...
			</Box>
		);

	if (error)
		return (
			<Box mt={4} textAlign="center">
				<Alert
					severity="error"
					action={
						<Button color="inherit" size="small" onClick={handleRetry}>
							Reintentar
						</Button>
					}
				>
					Error al cargar las personas
				</Alert>
			</Box>
		);

	return (
		<>
			<Stack spacing={2} mb={2}>
				<TextField
					label="Buscar personas"
					variant="outlined"
					fullWidth
					value={searchTerm}
					onChange={handleSearchChange}
				/>
			</Stack>

			<TableContainer component={Paper} sx={{ maxHeight: 350 }}>
				<Table stickyHeader size="small">
					<TableHead>
						<TableRow>
							<TableCell>Identificación</TableCell>
							<TableCell>Nombres</TableCell>
							<TableCell>Apellidos</TableCell>
							<TableCell>Género</TableCell>
							<TableCell>Estado Civil</TableCell>
							<TableCell>Ciudad</TableCell>
							<TableCell>Acción</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{paginatedPersons.length > 0 ? (
							paginatedPersons.map((person) => (
								<TableRow key={person.per_id} hover>
									<TableCell>{person.per_identification}</TableCell>
									<TableCell>{person.per_names}</TableCell>
									<TableCell>{person.per_surnames}</TableCell>
									<TableCell>{person.genre_name}</TableCell>
									<TableCell>{person.name_marital_status}</TableCell>
									<TableCell>{person.per_city}</TableCell>
									<TableCell>
										<Button
											variant="outlined"
											size="small"
											onClick={() => onSelectPerson(person)}
										>
											Seleccionar
										</Button>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={7} align="center">
									No se encontraron personas.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>

				<TablePagination
					component="div"
					count={filteredPersons.length}
					page={page}
					onPageChange={handleChangePage}
					rowsPerPage={rowsPerPage}
					onRowsPerPageChange={handleChangeRowsPerPage}
					rowsPerPageOptions={[5, 10, 25]}
					labelRowsPerPage="Filas por página"
				/>
			</TableContainer>

			<Snackbar
				open={alert.open}
				autoHideDuration={3000}
				onClose={handleCloseAlert}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					severity={alert.severity}
					onClose={handleCloseAlert}
					sx={{ width: "100%" }}
				>
					{alert.message}
				</Alert>
			</Snackbar>
		</>
	);
};
