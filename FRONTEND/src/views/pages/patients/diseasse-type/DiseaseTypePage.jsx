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
import DiseaseTypeForm from "./DiseaseTypeForm";

const API_BASE = "http://localhost:5000";

export default function DiseaseTypePage() {
	const [diseaseTypes, setDiseaseTypes] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const [formOpen, setFormOpen] = useState(false);
	const [editDiseaseType, setEditDiseaseType] = useState(null);

	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "success",
	});

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [filterText, setFilterText] = useState("");

	const fetchDiseaseTypes = async () => {
		setLoading(true);
		try {
			const res = await axios.get(`${API_BASE}/catalog/disease-type/list`, {
				headers: { tokenapp: Cookies.get("token") },
			});
			setDiseaseTypes(res?.data.data.data || []);
			setError(null);
		} catch (err) {
			setError("Error al cargar tipos de enfermedad");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDiseaseTypes();
	}, []);

	const handleAdd = () => {
		setEditDiseaseType(null);
		setFormOpen(true);
	};

	const handleEdit = (diseaseType) => {
		setEditDiseaseType(diseaseType);
		setFormOpen(true);
	};

	const handleDelete = async (dst_id) => {
		if (!window.confirm("¿Está seguro de eliminar este tipo de enfermedad?"))
			return;
		try {
			await axios.delete(`${API_BASE}/catalog/disease-type/delete/${dst_id}`, {
				headers: { tokenapp: Cookies.get("token") },
			});
			setSnackbar({
				open: true,
				message: "Tipo de enfermedad eliminado",
				severity: "success",
			});
			fetchDiseaseTypes();
		} catch (err) {
			setSnackbar({
				open: true,
				message: "Error al eliminar",
				severity: "error",
			});
		}
	};

	const handleFormSuccess = () => {
		fetchDiseaseTypes();
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

	const filteredTypes = diseaseTypes.filter((dt) =>
		dt.dst_name.toLowerCase().includes(filterText.toLowerCase()),
	);

	return (
		<div>
			<Typography variant="h4" gutterBottom>
				Gestión de Tipos de Enfermedad
			</Typography>

			<Button variant="contained" onClick={handleAdd} sx={{ mb: 2 }}>
				Nuevo Tipo de Enfermedad
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
						) : filteredTypes.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} align="center">
									No se encontraron resultados.
								</TableCell>
							</TableRow>
						) : (
							filteredTypes
								.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
								.map((dt) => (
									<TableRow key={dt.dst_id}>
										<TableCell>{dt.dst_id}</TableCell>
										<TableCell>{dt.dst_name}</TableCell>
										<TableCell>{dt.dst_description}</TableCell>
										<TableCell align="right">
											<IconButton
												onClick={() => handleEdit(dt)}
												size="small"
												color="primary"
											>
												<EditIcon />
											</IconButton>
											<IconButton
												onClick={() => handleDelete(dt.dst_id)}
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
				count={filteredTypes.length}
				page={page}
				onPageChange={handleChangePage}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				rowsPerPageOptions={[5, 10, 25, 50]}
			/>

			<DiseaseTypeForm
				open={formOpen}
				onClose={() => setFormOpen(false)}
				onSuccess={handleFormSuccess}
				editDiseaseType={editDiseaseType}
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
