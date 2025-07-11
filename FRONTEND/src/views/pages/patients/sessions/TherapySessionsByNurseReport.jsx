import React, { useState, useEffect } from "react";
import {
	Box,
	Button,
	TextField,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination,
	Paper,
	CircularProgress,
	Alert,
	Stack,
	Autocomplete,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";

const TherapySessionsByMedicalStaffReport = () => {
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [medicalStaffList, setMedicalStaffList] = useState([]);
	const [selectedMedicalStaff, setSelectedMedicalStaff] = useState(null);
	const [sessions, setSessions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	const theme = useTheme();
	const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

	useEffect(() => {
		const fetchMedicalStaff = async () => {
			try {
				const response = await axios.get(
					`${import.meta.env.VITE_API_URL}/admin/Medical_staff/list`,
					{
						headers: { tokenapp: Cookies.get("token") },
					},
				);

				if (response?.data.result) {
					const list = Array.isArray(response?.data.data.data)
						? response?.data.data.data
						: [];
					setMedicalStaffList(list);
				} else {
					setMedicalStaffList([]);
				}
			} catch (error) {
				setMedicalStaffList([]);
			}
		};
		fetchMedicalStaff();
	}, []);

	const fetchSessions = async () => {
		if (!startDate || !endDate) {
			setError("Por favor, selecciona las fechas.");
			setSessions([]);
			return;
		}
		setError("");
		setLoading(true);

		try {
			const body = {
				start_date: startDate,
				end_date: endDate,
				medical_staff_id: selectedMedicalStaff
					? selectedMedicalStaff.med_id
					: undefined,
			};

			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}/clinic/TherapySession/report/by-nurse`,
				body,
				{ headers: { tokenapp: Cookies.get("token") } },
			);

			if (response.data.result) {
				setSessions(response.data.data);
				setPage(0);
			} else {
				setSessions([]);
				setError(response.data.message || "No se encontraron sesiones.");
			}
		} catch (error) {
			setError("Error al obtener datos del servidor.");
			setSessions([]);
		}

		setLoading(false);
	};

	const handleChangePage = (_, newPage) => setPage(newPage);
	const handleChangeRowsPerPage = (e) => {
		setRowsPerPage(parseInt(e.target.value, 10));
		setPage(0);
	};

	const paginatedRows = sessions.slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage,
	);

	return (
		<Paper
			elevation={3}
			sx={{
				p: { xs: 2, sm: 4 },
				maxWidth: 1200,
				margin: "auto",
				mt: 4,
				mb: 4,
				borderRadius: 2,
			}}
		>
			<Typography
				variant={isSmDown ? "h6" : "h5"}
				gutterBottom
				sx={{ fontWeight: 600 }}
			>
				Reporte de Sesiones por Personal Médico y Fechas
			</Typography>

			<Box
				component="form"
				onSubmit={(e) => {
					e.preventDefault();
					fetchSessions();
				}}
				sx={{
					display: "flex",
					flexWrap: "wrap",
					gap: 2,
					mb: 3,
					alignItems: "center",
				}}
				noValidate
				autoComplete="off"
			>
				<TextField
					label="Fecha Inicio"
					type="date"
					value={startDate}
					onChange={(e) => setStartDate(e.target.value)}
					InputLabelProps={{ shrink: true }}
					required
					sx={{ flex: "1 1 180px", minWidth: 180 }}
				/>

				<TextField
					label="Fecha Fin"
					type="date"
					value={endDate}
					onChange={(e) => setEndDate(e.target.value)}
					InputLabelProps={{ shrink: true }}
					required
					sx={{ flex: "1 1 180px", minWidth: 180 }}
				/>

				<Autocomplete
					options={Array.isArray(medicalStaffList) ? medicalStaffList : []}
					getOptionLabel={(option) =>
						option.med_id
							? `${option.med_id} - ${option.med_specialty || option.med_id}`
							: ""
					}
					value={selectedMedicalStaff}
					onChange={(_, newValue) => setSelectedMedicalStaff(newValue)}
					sx={{ flex: "1 1 300px", minWidth: 300 }}
					renderInput={(params) => (
						<TextField {...params} label="Personal Médico (opcional)" />
					)}
					clearOnEscape
				/>

				<Stack direction="row" spacing={2}>
					<Button
						variant="contained"
						color="primary"
						type="submit"
						disabled={loading}
						sx={{ minWidth: 120, height: 40 }}
					>
						{loading ? (
							<CircularProgress size={24} color="inherit" />
						) : (
							"Buscar"
						)}
					</Button>
				</Stack>
			</Box>

			{error && (
				<Alert severity="error" sx={{ mb: 3 }}>
					{error}
				</Alert>
			)}

			<TableContainer
				component={Paper}
				variant="outlined"
				sx={{ maxHeight: 500, overflowY: "auto" }}
			>
				<Table
					stickyHeader
					size={isSmDown ? "small" : "medium"}
					aria-label="sesiones de terapia"
				>
					<TableHead
						sx={{
							backgroundColor: theme.palette.grey[100],
							"& th": { fontWeight: 700 },
						}}
					>
						<TableRow>
							<TableCell>ID</TableCell>
							<TableCell>N° Sesión</TableCell>
							<TableCell>Fecha Agendada</TableCell>
							<TableCell>Fecha Ejecutada</TableCell>
							<TableCell>Producto</TableCell>
							<TableCell>Tipo Terapia</TableCell>
							<TableCell>Personal Médico</TableCell>
							<TableCell>Consumido</TableCell>
							<TableCell>Estado</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{paginatedRows.length > 0 ? (
							paginatedRows.map((row) => (
								<TableRow key={row.sec_id} hover>
									<TableCell>{row.sec_id}</TableCell>
									<TableCell>{row.sec_ses_number}</TableCell>
									<TableCell>{row.agendada}</TableCell>
									<TableCell>{row.ejecutada}</TableCell>
									<TableCell>{row.pro_name}</TableCell>
									<TableCell>{row.tht_name}</TableCell>
									<TableCell>{row.personal_medico}</TableCell>
									<TableCell>{row.ses_consumed ? "Sí" : "No"}</TableCell>
									<TableCell>{row.ses_state ? "Activo" : "Inactivo"}</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={9} align="center" sx={{ py: 4 }}>
									No hay sesiones para mostrar.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<TablePagination
				component="div"
				count={sessions.length}
				page={page}
				onPageChange={handleChangePage}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				rowsPerPageOptions={[5, 10, 25]}
				labelRowsPerPage="Filas por página:"
			/>
		</Paper>
	);
};

export default TherapySessionsByMedicalStaffReport;
