import React from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Button,
} from "@mui/material";

export default function DeletePatientModal({
	open,
	onClose,
	onConfirm,
	patient,
}) {
	if (!patient) return null;

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>Eliminar Paciente</DialogTitle>
			<DialogContent>
				<DialogContentText>
					¿Está seguro de eliminar al paciente{" "}
					<strong>
						{patient.per_names} {patient.per_surnames}
					</strong>
					? Esta acción no se puede deshacer.
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancelar</Button>
				<Button onClick={onConfirm} color="error" variant="contained">
					Eliminar
				</Button>
			</DialogActions>
		</Dialog>
	);
}
