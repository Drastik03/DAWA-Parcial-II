import React from "react";
import {
	Paper,
	Stack,
	TextField,
	Checkbox,
	FormControlLabel,
	Button,
	Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "../../../../context/AuthContext";

const API_BASE = "http://localhost:5000/";

const AddMedicalHistoryForm = ({ patientId, onCreated }) => {
	const { user } = useAuth();
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm();

	const onSubmit = async (data) => {
		try {
			const payload = {
				...data,
				hist_patient_id: parseInt(patientId),
				user_created: user.user.user_login_id,
			};

			const res = await axios.post(
				`${API_BASE}medical-histories/insert`,
				payload,
				{
					headers: { tokenapp: Cookies.get("token") },
				},
			);

			if (res.data.result) {
				alert("Historial creado");
				reset();
				onCreated?.();
			} else {
				alert(res.data.message);
			}
		} catch (err) {
			alert("Error al crear historial");
		}
	};

	return (
		<Paper sx={{ p: 3, mt: 2 }}>
			<Typography variant="h6" gutterBottom>
				Nuevo Historial Médico
			</Typography>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Stack spacing={2}>
					<TextField
						label="Motivo principal"
						{...register("hist_primary_complaint", { required: true })}
						error={!!errors.hist_primary_complaint}
						helperText={errors.hist_primary_complaint && "Campo requerido"}
					/>
					<TextField
						label="Fecha de inicio"
						type="date"
						{...register("hist_onset_date", { required: true })}
						InputLabelProps={{ shrink: true }}
						error={!!errors.hist_onset_date}
					/>
					<FormControlLabel
						control={<Checkbox {...register("hist_related_trauma")} />}
						label="¿Trauma relacionado?"
					/>
					<TextField
						label="Tratamiento actual"
						multiline
						rows={2}
						{...register("hist_current_treatment")}
					/>
					<TextField
						label="Notas"
						multiline
						rows={2}
						{...register("hist_notes")}
					/>
					<Button variant="contained" color="primary" type="submit">
						Guardar Historial
					</Button>
				</Stack>
			</form>
		</Paper>
	);
};

export default AddMedicalHistoryForm;
