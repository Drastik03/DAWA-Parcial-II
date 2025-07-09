import React, { useEffect, useState, useCallback } from "react";
import {
	Paper,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	IconButton,
	Snackbar,
	Alert,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Button,
} from "@mui/material";
import axios from "axios";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { useAuth } from "../../../../../context/AuthContext";
import { DeleteIcon, EditIcon } from "lucide-react";
import AddPatientDiseaseForm from "./AddPatientDiseaseForm";
import EditModalPatientDisease from "./EditModalPatientDisease";

const API_BASE = "http://localhost:5000/";

export const PatientDiseasePage = () => {
	const { patientId } = useParams();
	const { user } = useAuth();

	const [diseases, setDiseases] = useState([]);
	const [alert, setAlert] = useState({
		open: false,
		message: "",
		severity: "info",
	});

	const [editModalOpen, setEditModalOpen] = useState(false);
	const [selectedDisease, setSelectedDisease] = useState(null);

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [diseaseToDelete, setDiseaseToDelete] = useState(null);

	const fetchDiseases = useCallback(async () => {
		try {
			const res = await axios.get(
				`${API_BASE}clinic/patient-disease/get/${patientId}`,
				{
					headers: { tokenapp: Cookies.get("token") },
				},
			);
			if (res.data.result) {
				setDiseases(res.data.data);
			} else {
				setAlert({ open: true, message: res.data.message, severity: "error" });
			}
		} catch (error) {
			setAlert({
				open: true,
				message: "Error cargando enfermedades",
				severity: "error",
			});
		}
	}, [patientId]);

	useEffect(() => {
		if (patientId) fetchDiseases();
	}, [fetchDiseases]);

	const handleDeleteConfirm = (disease) => {
		setDiseaseToDelete(disease);
		setConfirmOpen(true);
	};

	const handleDeleteCancel = () => {
		setDiseaseToDelete(null);
		setConfirmOpen(false);
	};

	const handleDelete = async () => {
		if (!diseaseToDelete) return;
		try {
			const res = await axios.delete(
				`${API_BASE}clinic/patient-disease/delete/${diseaseToDelete.pd_id}`,
				{
					headers: { tokenapp: Cookies.get("token") },
				},
			);
			if (res.data.result) {
				setAlert({
					open: true,
					message: "Enfermedad eliminada",
					severity: "success",
				});
				fetchDiseases();
			} else {
				setAlert({ open: true, message: res.data.message, severity: "error" });
			}
		} catch {
			setAlert({
				open: true,
				message: "Error al eliminar enfermedad",
				severity: "error",
			});
		} finally {
			setDiseaseToDelete(null);
			setConfirmOpen(false);
		}
	};

	return (
		<Paper sx={{ p: 3, m: 2 }}>
			<Typography variant="h5" gutterBottom>
				Enfermedades del Paciente #{patientId}
			</Typography>

			<AddPatientDiseaseForm
				patientId={patientId}
				onSuccess={fetchDiseases} 
			/>

			<Typography variant="h6" mt={4} mb={2}>
				Lista de Enfermedades
			</Typography>

			<TableContainer component={Paper}>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>ID</TableCell>
							<TableCell>Enfermedad</TableCell>
							<TableCell>Actual</TableCell>
							<TableCell>Notas</TableCell>
							<TableCell>Usuario</TableCell>
							<TableCell>Fecha</TableCell>
							<TableCell align="center">Acciones</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{diseases.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} align="center">
									No hay enfermedades registradas.
								</TableCell>
							</TableRow>
						) : (
							diseases.data?.map((disease) => (
								<TableRow key={disease.pd_id}>
									<TableCell>{disease.pd_id}</TableCell>
									<TableCell>{disease.disease_name}</TableCell>
									<TableCell>{disease.pd_is_current ? "Sí" : "No"}</TableCell>
									<TableCell>{disease.pd_notes}</TableCell>
									<TableCell>{disease.user_created}</TableCell>
									<TableCell>{disease.date_created}</TableCell>
									<TableCell align="center">
										<Tooltip title="Editar enfermedad">
											<IconButton
												onClick={() => {
													setSelectedDisease(disease);
													setEditModalOpen(true);
												}}
											>
												<EditIcon />
											</IconButton>
										</Tooltip>
										<Tooltip title="Quitar enfermedad">
											<IconButton
												color="error"
												onClick={() => handleDeleteConfirm(disease)}
											>
												<DeleteIcon />
											</IconButton>
										</Tooltip>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<EditModalPatientDisease
				open={editModalOpen}
				onClose={() => {
					setEditModalOpen(false);
					setSelectedDisease(null);
				}}
				defaultValues={selectedDisease}
				onSubmit={async (formValues) => {
					try {
						const pd_id = selectedDisease?.pd_id;
						if (!pd_id) throw new Error("ID de enfermedad no definido");

						const payload = {
							pd_disease_id: formValues.pd_disease_id,
							pd_notes: formValues.pd_notes,
							pd_is_current: formValues.pd_is_current,
							user_modified: user.user.user_login_id,
						};

						const res = await axios.patch(
							`${API_BASE}clinic/patient-disease/update/${pd_id}`,
							payload,
							{
								headers: { tokenapp: Cookies.get("token") },
							},
						);

						if (res?.data.result) {
							setAlert({
								open: true,
								message: "Enfermedad actualizada correctamente",
								severity: "success",
							});
							setEditModalOpen(false);
							setSelectedDisease(null);
							fetchDiseases();
						} else {
							setAlert({
								open: true,
								message: res?.data.message,
								severity: "error",
							});
						}
					} catch (error) {
						setAlert({
							open: true,
							message: error.message || "Error al actualizar enfermedad",
							severity: "error",
						});
					}
				}}
			/>

			<Dialog open={confirmOpen} onClose={handleDeleteCancel}>
				<DialogTitle>Confirmar Eliminación</DialogTitle>
				<DialogContent>
					<DialogContentText>
						¿Está seguro que desea eliminar esta enfermedad?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteCancel}>Cancelar</Button>
					<Button color="error" onClick={handleDelete}>
						Eliminar
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={alert.open}
				autoHideDuration={3000}
				onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
			>
				<Alert severity={alert.severity}>{alert.message}</Alert>
			</Snackbar>
		</Paper>
	);
};
