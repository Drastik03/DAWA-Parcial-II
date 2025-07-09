import React, { useState, useEffect, useCallback } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	TablePagination,
	TextField,
	InputAdornment,
	Box,
	Tooltip,
	Typography,
	IconButton,
	Dialog,
	Button,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router";
import {
	AlertTriangleIcon,
	BriefcaseMedicalIcon,
	Delete,
	Edit,
	SearchIcon,
} from "lucide-react";
import { IconEye } from "@tabler/icons";
import EditPatientForm from "./EditPatientForm";

const API_BASE = "http://localhost:5000/";



function DeletePatientModal({ open, onClose, onConfirm, patient }) {
	if (!patient) return null;

	return (
		<Dialog open={open} onClose={onClose}>
			<Box sx={{ p: 3 }}>
				<Typography variant="h6" mb={2}>
					Eliminar Paciente
				</Typography>
				<Typography>
					¿Está seguro de eliminar al paciente{" "}
					<strong>
						{patient.per_names} {patient.per_surnames}
					</strong>
					? Esta acción no se puede deshacer.
				</Typography>
				<Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
					<Button onClick={onClose}>Cancelar</Button>
					<Button onClick={onConfirm} color="error" variant="contained">
						Eliminar
					</Button>
				</Box>
			</Box>
		</Dialog>
	);
}

const PatientsTable = () => {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);

	const [search, setSearch] = useState("");
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	const [editPatient, setEditPatient] = useState(null);
	const [modalEditOpen, setModalEditOpen] = useState(false);

	const [deletePatient, setDeletePatient] = useState(null);
	const [modalDeleteOpen, setModalDeleteOpen] = useState(false);

	const navigate = useNavigate();

	const fetchPatients = useCallback(async () => {
		setLoading(true);
		try {
			const res = await axios.get(`${API_BASE}clinic/patients/list`, {
				headers: { tokenapp: Cookies.get("token") },
			});
			if (res.data.result) {
				setData(res.data.data || []);
			} else {
				alert("Error: " + res.data.message);
				setData([]);
			}
		} catch (error) {
			console.error(error);
			alert("Error al cargar pacientes");
			setData([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchPatients();
	}, [fetchPatients]);

	const handleChangePage = (_, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const filteredRows = data.filter(
		(row) =>
			row.pat_code?.toLowerCase().includes(search.toLowerCase()) ||
			`${row.per_names} ${row.per_surnames}`
				.toLowerCase()
				.includes(search.toLowerCase()),
	);

	const paginatedRows = filteredRows.slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage,
	);

	const handleOpenEdit = (patient) => {
		setEditPatient(patient);
		setModalEditOpen(true);
	};

	const handleCloseEdit = () => {
		setModalEditOpen(false);
		setEditPatient(null);
	};

	const handleOpenDelete = (patient) => {
		setDeletePatient(patient);
		setModalDeleteOpen(true);
	};

	const handleCloseDelete = () => {
		setModalDeleteOpen(false);
		setDeletePatient(null);
	};

	const handleDeleteConfirm = async () => {
		try {
			const endpoint = `${API_BASE}clinic/patients/delete/${deletePatient.pat_id}`;
			const res = await axios.delete(endpoint, {
				headers: { tokenapp: Cookies.get("token") },
			});

			if (res.data.result) {
				setModalDeleteOpen(false);
				setDeletePatient(null);
				fetchPatients();
			} else {
				alert("Error: " + res.data.message);
			}
		} catch (error) {
			console.error(error);
			alert("Error al eliminar el paciente");
		}
	};

	if (loading) return <div>Cargando...</div>;

	return (
		<Box sx={{ mt: 4 }}>
			<TextField
				label="Buscar por código o nombre"
				variant="outlined"
				size="small"
				fullWidth
				sx={{ mb: 2 }}
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<SearchIcon size={18} />
						</InputAdornment>
					),
				}}
			/>

			<TableContainer component={Paper}>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>ID</TableCell>
							<TableCell>Código</TableCell>
							<TableCell>Paciente</TableCell>
							<TableCell>Cliente</TableCell>
							<TableCell>Condiciones</TableCell>
							<TableCell>Alergias</TableCell>
							<TableCell>Emergencia</TableCell>
							<TableCell align="center" sx={{ width: 240 }}>
								Acciones
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{paginatedRows.map((row) => (
							<TableRow key={row.pat_id} hover>
								<TableCell>{row.pat_id}</TableCell>
								<TableCell>{row.pat_code}</TableCell>
								<TableCell>
									{row.per_names} {row.per_surnames}
								</TableCell>
								<TableCell>{row.cli_name}</TableCell>
								<TableCell>
									<Tooltip
										title={row.pat_medical_conditions || "Sin condiciones"}
									>
										<Box display="flex" alignItems="center" gap={1}>
											<BriefcaseMedicalIcon size={16} />
											<Typography variant="body2" noWrap>
												{row.pat_medical_conditions || "-"}
											</Typography>
										</Box>
									</Tooltip>
								</TableCell>
								<TableCell>
									<Tooltip title={row.pat_allergies || "Sin alergias"}>
										<Box display="flex" alignItems="center" gap={1}>
											<AlertTriangleIcon size={16} />
											<Typography variant="body2" noWrap>
												{row.pat_allergies || "-"}
											</Typography>
										</Box>
									</Tooltip>
								</TableCell>
								<TableCell>
									{row.pat_emergency_contact_name} <br />
									{row.pat_emergency_contact_phone}
								</TableCell>
								<TableCell align="center">
									<Box
										display="flex"
										justifyContent="center"
										flexWrap="nowrap"
										gap={0.5}
									>
										<Tooltip title="Ver Enfermedades">
											<IconButton
												size="small"
												color="primary"
												onClick={() =>
													navigate(`/clinic/patients/${row.pat_id}/diseases`)
												}
											>
												<BriefcaseMedicalIcon size={16} />
											</IconButton>
										</Tooltip>
										<Tooltip title="Ver Alergias">
											<IconButton
												size="small"
												color="warning"
												onClick={() =>
													navigate(`/clinic/patients/${row.pat_id}/allergy`)
												}
											>
												<AlertTriangleIcon size={16} />
											</IconButton>
										</Tooltip>
										<Tooltip title="Ver Historial Médico">
											<IconButton
												size="small"
												color="info"
												onClick={() =>
													navigate(
														`/clinic/patients/${row.pat_id}/medical-history`,
													)
												}
											>
												<IconEye size={16} />
											</IconButton>
										</Tooltip>
										<Tooltip title="Editar Paciente">
											<IconButton
												size="small"
												color="secondary"
												onClick={() => handleOpenEdit(row)}
											>
												<Edit size={16} />
											</IconButton>
										</Tooltip>
										<Tooltip title="Eliminar Paciente">
											<IconButton
												size="small"
												color="error"
												onClick={() => handleOpenDelete(row)}
											>
												<Delete size={16} />
											</IconButton>
										</Tooltip>
									</Box>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>

				<TablePagination
					component="div"
					count={filteredRows.length}
					page={page}
					onPageChange={handleChangePage}
					rowsPerPage={rowsPerPage}
					onRowsPerPageChange={handleChangeRowsPerPage}
					rowsPerPageOptions={[5, 10, 25, 50]}
					labelRowsPerPage="Filas por página"
				/>
			</TableContainer>

			<EditPatientForm
				open={modalEditOpen}
				onClose={handleCloseEdit}
				patient={editPatient}
				onSuccess={fetchPatients}
			/>

			<DeletePatientModal
				open={modalDeleteOpen}
				onClose={handleCloseDelete}
				patient={deletePatient}
				onConfirm={handleDeleteConfirm}
			/>
		</Box>
	);
};

export default PatientsTable;
