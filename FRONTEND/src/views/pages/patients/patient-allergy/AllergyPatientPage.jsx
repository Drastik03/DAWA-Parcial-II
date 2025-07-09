import React, { useCallback, useEffect, useState } from "react";
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
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { DeleteIcon, EditIcon } from "lucide-react";
import AddPatientAllergyForm from "./AddPatientAllergyForm";
import EditModalPatientAllergy from "./EditModalPatientAllergy";
import { useAuth } from "../../../../context/AuthContext";

const API_BASE = "http://localhost:5000/";

const AllergyPatientPage = () => {
	const { patientId } = useParams();
	const { user } = useAuth();

	const [allergies, setAllergies] = useState([]);
	const [alert, setAlert] = useState({
		open: false,
		message: "",
		severity: "info",
	});
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [selectedAllergy, setSelectedAllergy] = useState(null);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [allergyToDelete, setAllergyToDelete] = useState(null);

	const fetchAllergies = useCallback(async () => {
		try {
			const res = await axios.get(
				`${API_BASE}clinic/patient-allergy/get/${patientId}`,
				{
					headers: { tokenapp: Cookies.get("token") },
				},
			);

			if (
				res.data.result &&
				res.data.data &&
				res.data.data.result &&
				Array.isArray(res.data.data.data)
			) {
				setAllergies(res.data.data.data);
			} else {
				setAllergies([]);
			}
		} catch {
			setAlert({
				open: true,
				message: "Error cargando alergias",
				severity: "error",
			});
		}
	}, [patientId]);

	useEffect(() => {
		if (patientId) fetchAllergies();
	}, [fetchAllergies]);

	const handleDelete = async () => {
		if (!allergyToDelete) return;
		try {
			const res = await axios.delete(
				`${API_BASE}clinic/patient-allergy/delete/${allergyToDelete.pa_id}`,
				{ headers: { tokenapp: Cookies.get("token") } },
			);
			if (res.data.result) {
				setAlert({
					open: true,
					message: "Alergia eliminada",
					severity: "success",
				});
				fetchAllergies();
			} else {
				setAlert({ open: true, message: res.data.message, severity: "error" });
			}
		} catch {
			setAlert({
				open: true,
				message: "Error al eliminar alergia",
				severity: "error",
			});
		} finally {
			setConfirmOpen(false);
			setAllergyToDelete(null);
		}
	};

	return (
		<Paper sx={{ p: 3, m: 2 }}>
			<Typography variant="h5">Alergias del Paciente #{patientId}</Typography>

			<AddPatientAllergyForm patientId={patientId} onSuccess={fetchAllergies} />

			<Typography variant="h6" mt={4} mb={2}>
				Lista de Alergias
			</Typography>
			<TableContainer component={Paper}>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>ID</TableCell>
							<TableCell>Alergia</TableCell>
							<TableCell>Reacción</TableCell>
							<TableCell>Usuario</TableCell>
							<TableCell>Fecha</TableCell>
							<TableCell align="center">Acciones</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{allergies.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} align="center">
									No hay alergias registradas.
								</TableCell>
							</TableRow>
						) : (
							allergies.map((row) => (
								<TableRow key={row.pa_id}>
									<TableCell>{row.pa_id}</TableCell>
									<TableCell>{row.allergy_name}</TableCell>
									<TableCell>{row.pa_reaction_description}</TableCell>
									<TableCell>{row.user_created}</TableCell>
									<TableCell>{row.date_created}</TableCell>
									<TableCell align="center">
										<Tooltip title="Editar alergia">
											<IconButton
												onClick={() => {
													setSelectedAllergy(row);
													setEditModalOpen(true);
												}}
											>
												<EditIcon />
											</IconButton>
										</Tooltip>
										<Tooltip title="Eliminar alergia">
											<IconButton
												color="error"
												onClick={() => {
													setAllergyToDelete(row);
													setConfirmOpen(true);
												}}
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

			<EditModalPatientAllergy
				open={editModalOpen}
				onClose={() => {
					setEditModalOpen(false);
					setSelectedAllergy(null);
				}}
				defaultValues={selectedAllergy}
				onSubmit={async (formValues) => {
					try {
						const payload = {
							...formValues,
							user_modified: user.user.user_login_id,
						};
						const res = await axios.patch(
							`${API_BASE}clinic/patient-allergy/update/${selectedAllergy.pa_id}`,
							payload,
							{ headers: { tokenapp: Cookies.get("token") } },
						);
						if (res.data.result) {
							setAlert({
								open: true,
								message: "Alergia actualizada",
								severity: "success",
							});
							setEditModalOpen(false);
							setSelectedAllergy(null);
							fetchAllergies();
						} else {
							setAlert({
								open: true,
								message: res.data.message,
								severity: "error",
							});
						}
					} catch {
						setAlert({
							open: true,
							message: "Error actualizando alergia",
							severity: "error",
						});
					}
				}}
			/>

			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
				<DialogTitle>Confirmar eliminación</DialogTitle>
				<DialogContent>
					<DialogContentText>
						¿Está seguro de eliminar esta alergia?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
					<Button color="error" onClick={handleDelete}>
						Eliminar
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={alert.open}
				autoHideDuration={3000}
				onClose={() => setAlert({ ...alert, open: false })}
			>
				<Alert severity={alert.severity}>{alert.message}</Alert>
			</Snackbar>
		</Paper>
	);
};

export default AllergyPatientPage;
