import React, { useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Grid,
	FormControlLabel,
	Checkbox,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE = import.meta.env.VITE_API_URL;

export default function EditMedicalHistoryForm({
	open,
	onClose,
	onSuccess,
	editHistory,
}) {
	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors, isSubmitting },
	} = useForm({
		defaultValues: {
			hist_primary_complaint: "",
			hist_onset_date: "",
			hist_related_trauma: false,
			hist_current_treatment: "",
			hist_notes: "",
		},
	});

	useEffect(() => {
		if (editHistory) {
			let onsetDate = "";
			if (editHistory.hist_onset_date) {
				const parts = editHistory.hist_onset_date.split("/");
				if (parts.length === 3) {
					const [dd, mm, yyyy] = parts;
					onsetDate = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
				}
			}

			reset({
				hist_primary_complaint: editHistory.hist_primary_complaint || "",
				hist_onset_date: onsetDate,
				hist_related_trauma: !!editHistory.hist_related_trauma,
				hist_current_treatment: editHistory.hist_current_treatment || "",
				hist_notes: editHistory.hist_notes || "",
			});
		} else {
			reset();
		}
	}, [editHistory, reset]);

	const onSubmit = async (data) => {
		try {
            const endpoint = `${API_BASE}/medical-histories/update/${editHistory.hist_id}`;
			const res = await axios.patch(endpoint, data, {
				headers: { tokenapp: Cookies.get("token") },
			});

			if (res.data.result) {
				onSuccess();
			} else {
				alert("Error: " + res.data.message);
			}
		} catch (error) {
			console.error(error);
			alert("Error al actualizar el historial");
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="sm"
			scroll="paper"
		>
			<DialogTitle>Editar Historial Médico</DialogTitle>
			<DialogContent dividers>
				{/** biome-ignore lint/nursery/useUniqueElementIds: <explanation> */}
				<form id="edit-medical-history-form" onSubmit={handleSubmit(onSubmit)}>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<TextField
								label="Queja Principal"
								fullWidth
								{...register("hist_primary_complaint", {
									required: "La queja principal es obligatoria",
									maxLength: { value: 255, message: "Máximo 255 caracteres" },
								})}
								error={!!errors.hist_primary_complaint}
								helperText={errors.hist_primary_complaint?.message}
								disabled={isSubmitting}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<TextField
								label="Fecha de inicio"
								type="date"
								fullWidth
								InputLabelProps={{ shrink: true }}
								{...register("hist_onset_date", {
									required: "La fecha de inicio es obligatoria",
								})}
								error={!!errors.hist_onset_date}
								helperText={errors.hist_onset_date?.message}
								disabled={isSubmitting}
							/>
						</Grid>

						<Grid
							item
							xs={12}
							sm={6}
							display="flex"
							alignItems="center"
							sx={{ mt: 1 }}
						>
							<FormControlLabel
								control={
									<Controller
										name="hist_related_trauma"
										control={control}
										render={({ field }) => (
											<Checkbox
												{...field}
												checked={field.value}
												disabled={isSubmitting}
											/>
										)}
									/>
								}
								label="¿Trauma relacionado?"
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								label="Tratamiento actual"
								fullWidth
								multiline
								rows={2}
								{...register("hist_current_treatment")}
								disabled={isSubmitting}
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								label="Notas"
								fullWidth
								multiline
								rows={3}
								{...register("hist_notes")}
								disabled={isSubmitting}
							/>
						</Grid>
					</Grid>
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={isSubmitting}>
					Cancelar
				</Button>
				<Button
					type="submit"
					form="edit-medical-history-form"
					variant="contained"
					disabled={isSubmitting}
				>
					Guardar Cambios
				</Button>
			</DialogActions>
		</Dialog>
	);
}
