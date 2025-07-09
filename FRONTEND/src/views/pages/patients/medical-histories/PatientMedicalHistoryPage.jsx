import React, { useEffect, useState, useCallback } from "react";
import {
	Paper,
	Typography,
	Box,
	Divider,
	IconButton,
	Tooltip,
	Snackbar,
	Alert,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Stack,
} from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { EditIcon, DeleteIcon } from "lucide-react";
import { IconEye } from "@tabler/icons";
import AddMedicalHistoryForm from "./AddMedicalHistoryForm";
import EditMedicalHistoryForm from "./EditMedicalHistoryForm";

const API_BASE = "http://localhost:5000/";

const PatientMedicalHistoryPage = () => {
	const { patientId } = useParams();
	const [histories, setHistories] = useState([]);
	const [alert, setAlert] = useState({
		open: false,
		message: "",
		severity: "info",
	});
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [historyToDelete, setHistoryToDelete] = useState(null);
	const [editOpen, setEditOpen] = React.useState(false);
	const [editHistory, setEditHistory] = React.useState(null);

	const fetchHistories = useCallback(async () => {
		try {
			const res = await axios.get(
				`${API_BASE}medical-histories/patientHist/${patientId}`,
				{
					headers: { tokenapp: Cookies.get("token") },
				},
			);
			if (res.data.result) {
				setHistories(res.data?.data || []);
			} else {
				setAlert({
					open: true,
					message: res.data.message,
					severity: "warning",
				});
				setHistories([]);
			}
		} catch {
			setAlert({
				open: true,
				message: "Error al obtener historial médico",
				severity: "error",
			});
		}
	}, [patientId]);
	const openEditModal = (hist) => {
		setEditHistory(hist);
		setEditOpen(true);
	};
	const closeEditModal = () => {
		setEditOpen(false);
		setEditHistory(null);
	};

	useEffect(() => {
		if (patientId) fetchHistories();
	}, [fetchHistories]);

	const handleDelete = async () => {
		if (!historyToDelete) return;
		try {
			const res = await axios.delete(
				`${API_BASE}clinic/patient-medical-history/delete/${historyToDelete.hist_id}`,
				{
					headers: { tokenapp: Cookies.get("token") },
					data: { user_deleted: Cookies.get("user_login_id") },
				},
			);
			if (res.data.result) {
				setAlert({
					open: true,
					message: "Historial eliminado",
					severity: "success",
				});
				fetchHistories();
			} else {
				setAlert({ open: true, message: res.data.message, severity: "error" });
			}
		} catch {
			setAlert({
				open: true,
				message: "Error al eliminar historial",
				severity: "error",
			});
		} finally {
			setConfirmOpen(false);
			setHistoryToDelete(null);
		}
	};

	return (
		<>
			<AddMedicalHistoryForm patientId={patientId} onCreated={fetchHistories} />

			<Paper sx={{ p: 3, m: 2, maxWidth: 900, marginX: "auto" }}>
				<Typography variant="h4" gutterBottom align="center">
					Historial Médico del Paciente #{patientId}
				</Typography>
				{histories.length === 0 ? (
					<Typography align="center" color="text.secondary" mt={5}>
						No hay historial registrado para este paciente.
					</Typography>
				) : (
					histories.map((hist) => (
						<Box
							key={hist.hist_id}
							sx={{
								border: "1px solid #ccc",
								borderRadius: 2,
								p: 3,
								mb: 3,
								boxShadow: 1,
								bgcolor: "background.paper",
							}}
						>
							<Stack
								direction="row"
								justifyContent="space-between"
								alignItems="center"
								mb={1}
							>
								<Typography variant="h6" fontWeight="bold">
									{hist.hist_primary_complaint}
								</Typography>

								<Box>
									<Tooltip title="Editar">
										<IconButton
											color="primary"
											size="small"
											onClick={() => openEditModal(hist)}
										>
											<EditIcon size={18} />
										</IconButton>
									</Tooltip>
								</Box>
							</Stack>

							<Divider sx={{ mb: 2 }} />

							<Stack
								spacing={1}
								direction={{ xs: "column", sm: "row" }}
								flexWrap="wrap"
								gap={3}
							>
								<Box minWidth={180}>
									<Typography variant="subtitle2" color="text.secondary">
										Fecha de inicio
									</Typography>
									<Typography>{hist.hist_onset_date}</Typography>
								</Box>

								<Box minWidth={180}>
									<Typography variant="subtitle2" color="text.secondary">
										Trauma relacionado
									</Typography>
									<Typography>
										{hist.hist_related_trauma ? "Sí" : "No"}
									</Typography>
								</Box>

								<Box minWidth={180}>
									<Typography variant="subtitle2" color="text.secondary">
										Tratamiento actual
									</Typography>
									<Typography>{hist.hist_current_treatment || "-"}</Typography>
								</Box>

								<Box flex={1} minWidth={200}>
									<Typography variant="subtitle2" color="text.secondary">
										Notas
									</Typography>
									<Typography>{hist.hist_notes || "-"}</Typography>
								</Box>
							</Stack>

							<Divider sx={{ mt: 2, mb: 1 }} />

							<Typography
								variant="caption"
								color="text.secondary"
								textAlign="right"
								display="block"
							>
								Creado por {hist.user_created} el {hist.date_created}
							</Typography>
						</Box>
					))
				)}
				<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
					<DialogTitle>Confirmar eliminación</DialogTitle>
					<DialogContent>
						<DialogContentText>
							¿Está seguro de eliminar este historial?
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
						<Button onClick={handleDelete} color="error">
							Eliminar
						</Button>
					</DialogActions>
				</Dialog>
				<Snackbar
					open={alert.open}
					autoHideDuration={3000}
					onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
					anchorOrigin={{ vertical: "top", horizontal: "center" }}
				>
					<Alert severity={alert.severity}>{alert.message}</Alert>
				</Snackbar>
				<EditMedicalHistoryForm
					open={editOpen}
					onClose={closeEditModal}
					editHistory={editHistory}
					onSuccess={() => {
						fetchHistories();
						closeEditModal();
					}}
				/>
				;
			</Paper>
		</>
	);
};

export default PatientMedicalHistoryPage;
