import React, { useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Grid,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useAuth } from "../../../../context/AuthContext";

export default function ViewPatientModal({ open, onClose, patient }) {
	const { user } = useAuth();

	const { register, reset } = useForm();

	useEffect(() => {
		if (patient) {
			reset({
				pat_code: patient.pat_code || "",
				pat_medical_conditions: patient.pat_medical_conditions || "",
				pat_allergies: patient.pat_allergies || "",
				pat_emergency_contact_name: patient.pat_emergency_contact_name || "",
				pat_emergency_contact_phone: patient.pat_emergency_contact_phone || "",
			});
		}
	}, [patient, reset]);

	if (!patient) return null;

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Ver Paciente</DialogTitle>
			<DialogContent dividers>
				<form>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<TextField
								label="Código"
								fullWidth
								value={patient.pat_code}
								InputProps={{ readOnly: true }}
								sx={{ bgcolor: "#f5f5f5" }}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								label="Condiciones médicas"
								fullWidth
								value={patient.pat_medical_conditions}
								InputProps={{ readOnly: true }}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								label="Alergias"
								fullWidth
								value={patient.pat_allergies}
								InputProps={{ readOnly: true }}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								label="Contacto de emergencia (Nombre)"
								fullWidth
								value={patient.pat_emergency_contact_name}
								InputProps={{ readOnly: true }}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								label="Contacto de emergencia (Teléfono)"
								fullWidth
								value={patient.pat_emergency_contact_phone}
								InputProps={{ readOnly: true }}
							/>
						</Grid>
					</Grid>
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cerrar</Button>
			</DialogActions>
		</Dialog>
	);
}
