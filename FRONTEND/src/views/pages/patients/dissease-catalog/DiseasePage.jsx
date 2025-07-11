import React, { useState, useEffect } from "react";
import {
	Typography,
	Button,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	IconButton,
	Paper,
	TableContainer,
	Snackbar,
	Alert,
	TablePagination,
	TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import Cookies from "js-cookie";
import DiseaseForm from "./DiseaseForm";

const API_BASE = import.meta.env.VITE_API_URL;

export default function DiseasePage() {
	const [diseases, setDiseases] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const [formOpen, setFormOpen] = useState(false);
	const [editDisease, setEditDisease] = useState(null);

	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "success",
	});

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [filterText, setFilterText] = useState("");

	const fetchDiseases = async () => {
		setLoading(true);
		try {
			const res = await axios.get(`${API_BASE}/catalog/disease/list`, {
				headers: { tokenapp: Cookies.get("token") },
			});
			setDiseases(res?.data.data.data || []);
			setError(null);
		} catch (err) {
			setError("Error al cargar enfermedades");
		} finally {
			setLoading(false);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		fetchDiseases();
	}, []);

	const handleAdd = () => {
		setEditDisease(null);
		setFormOpen(true);
	};

	const handleEdit = (disease) => {
		setEditDisease(disease);
		setFormOpen(true);
	};

	const handleDelete = async (dis_id) => {
		if (!window.confirm("¿Está seguro de eliminar esta enfermedad?")) return;
		try {
			await axios.delete(`${API_BASE}/catalog/disease/delete/${dis_id}`, {
				headers: { tokenapp: Cookies.get("token") },
			});
			setSnackbar({
				open: true,
				message: "Enfermedad eliminada",
				severity: "success",
			});
			fetchDiseases();
		} catch (err) {
			setSnackbar({
				open: true,
				message: "Error al eliminar",
				severity: "error",
			});
		}
	};

	const handleFormSuccess = () => {
		fetchDiseases();
		setSnackbar({
			open: true,
			message: "Guardado correctamente",
			severity: "success",
		});
	};

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const filteredDiseases = diseases.filter((dis) =>
		dis.dis_name.toLowerCase().includes(filterText.toLowerCase()),
	);

	return (
		<div>
			<Typography variant="h4" gutterBottom>
				Catálogo de Enfermedades
			</Typography>

			<Button variant="contained" onClick={handleAdd} sx={{ mb: 2 }}>
				Nueva Enfermedad
			</Button>

			<TextField
				fullWidth
				label="Buscar por nombre"
				variant="outlined"
				value={filterText}
				onChange={(e) => setFilterText(e.target.value)}
				sx={{ mb: 2 }}
			/>

			{error && <Alert severity="error">{error}</Alert>}

			<TableContainer component={Paper}>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>ID</TableCell>
							<TableCell>Nombre</TableCell>
							<TableCell>Descripción</TableCell>
							<TableCell>Tipo</TableCell>
							<TableCell align="right">Acciones</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={4} align="center">
									Cargando...
								</TableCell>
							</TableRow>
						) : filteredDiseases.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} align="center">
									No se encontraron enfermedades.
								</TableCell>
							</TableRow>
						) : (
							filteredDiseases
								.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
								.map((dis) => (
									<TableRow key={dis.dis_id}>
										<TableCell>{dis.dis_id}</TableCell>
										<TableCell>{dis.dis_name}</TableCell>
										<TableCell>{dis.dis_description}</TableCell>
										<TableCell>{dis.disease_type_name}</TableCell>
										<TableCell align="right">
											<IconButton
												onClick={() => handleEdit(dis)}
												size="small"
												color="primary"
											>
												<EditIcon />
											</IconButton>
											<IconButton
												onClick={() => handleDelete(dis.dis_id)}
												size="small"
												color="error"
											>
												<DeleteIcon />
											</IconButton>
										</TableCell>
									</TableRow>
								))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<TablePagination
				component="div"
				count={filteredDiseases.length}
				page={page}
				onPageChange={handleChangePage}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				rowsPerPageOptions={[5, 10, 25, 50]}
			/>

			<DiseaseForm
				open={formOpen}
				onClose={() => setFormOpen(false)}
				onSuccess={handleFormSuccess}
				editDisease={editDisease}
			/>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={() => setSnackbar({ ...snackbar, open: false })}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert severity={snackbar.severity} sx={{ width: "100%" }}>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</div>
	);
}
