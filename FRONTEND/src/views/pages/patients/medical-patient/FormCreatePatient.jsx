/** biome-ignore-all lint/nursery/useUniqueElementIds: <explanation> */
import React, { useEffect, useState } from "react";
import {
	Paper,
	Grid,
	TextField,
	Button,
	Snackbar,
	Alert,
	Typography,
	MenuItem,
	Select,
	InputLabel,
	FormControl,
	FormHelperText,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";

const validBloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const PatientForm = ({ selectedPerson, selectedClient, onCreated }) => {
	const {
		control,
		handleSubmit,
		reset,
		setValue,
		formState: { errors, isSubmitting, isValid },
	} = useForm({
		mode: "all",
		defaultValues: {
			pat_person_id: 0,
			pat_client_id: 0,
			pat_code: "",
			pat_medical_conditions: "",
			pat_allergies: "",
			pat_blood_type: "",
			pat_emergency_contact_name: "",
			pat_emergency_contact_phone: "",
		},
	});

	const [alert, setAlert] = useState({
		open: false,
		message: "",
		severity: "success",
	});

	useEffect(() => {
		if (selectedPerson && selectedClient) {
			setValue("pat_person_id", selectedPerson.per_id);
			setValue("pat_client_id", selectedClient.cli_id);
			setValue("pat_code", `PAT-${selectedPerson.per_id}`);
		}
	}, [selectedPerson, selectedClient, setValue]);

	const onSubmit = async (data) => {
		try {
			const res = await axios.post(
				`${import.meta.env.VITE_API_URL}/clinic/patients/add`,
				{
					...data,
					user_created: "admin",
				},

				{ headers: { tokenapp: Cookies.get("token") } },
			);

			if (res.data.result) {
				setAlert({
					open: true,
					message: "Paciente registrado exitosamente",
					severity: "success",
				});
				onCreated();
				reset();
			} else {
				setAlert({
					open: true,
					message: res.data.message || "Error al registrar",
					severity: "error",
				});
			}
		} catch (error) {
			setAlert({
				open: true,
				message: "Error de red o servidor",
				severity: "error",
			});
		}
	};

	return (
		<Paper sx={{ p: 3, mt: 3 }}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Grid container spacing={2}>
					<Grid item xs={12} sm={6}>
						<Controller
							name="pat_code"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Código Paciente"
									disabled
									fullWidth
								/>
							)}
						/>
					</Grid>

					<Grid item xs={12} sm={6}>
						<FormControl fullWidth error={!!errors.pat_blood_type} required>
							<InputLabel id="blood-type-label">Tipo de Sangre</InputLabel>
							<Controller
								name="pat_blood_type"
								control={control}
								rules={{
									required: "Tipo de sangre es obligatorio",
									validate: (value) =>
										validBloodTypes.includes(value) ||
										"Tipo de sangre inválido",
								}}
								render={({ field }) => (
									<Select
										{...field}
										labelId="blood-type-label"
										label="Tipo de Sangre"
									>
										<MenuItem value="">
											<em>Sin seleccionar</em>
										</MenuItem>
										{validBloodTypes.map((type) => (
											<MenuItem key={type} value={type}>
												{type}
											</MenuItem>
										))}
									</Select>
								)}
							/>
							{errors.pat_blood_type && (
								<FormHelperText>{errors.pat_blood_type.message}</FormHelperText>
							)}
						</FormControl>
					</Grid>

					<Grid item xs={12}>
						<Controller
							name="pat_medical_conditions"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Condiciones Médicas"
									multiline
									rows={2}
									fullWidth
								/>
							)}
						/>
					</Grid>

					<Grid item xs={12}>
						<Controller
							name="pat_allergies"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Alergias"
									multiline
									rows={2}
									fullWidth
								/>
							)}
						/>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Controller
							name="pat_emergency_contact_name"
							control={control}
							rules={{ required: "Nombre contacto emergencia es obligatorio" }}
							render={({ field }) => (
								<TextField
									{...field}
									label="Nombre de contacto de emergencia"
									error={!!errors.pat_emergency_contact_name}
									helperText={errors.pat_emergency_contact_name?.message}
									fullWidth
								/>
							)}
						/>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Controller
							name="pat_emergency_contact_phone"
							control={control}
							rules={{
								required: "Teléfono contacto emergencia es obligatorio",
							}}
							render={({ field }) => (
								<TextField
									{...field}
									label="Teléfono contacto de emergencia"
									error={!!errors.pat_emergency_contact_phone}
									helperText={errors.pat_emergency_contact_phone?.message}
									fullWidth
								/>
							)}
						/>
					</Grid>

					<Grid item xs={12}>
						<Button
							type="submit"
							variant="contained"
							color="primary"
							disabled={
								!selectedPerson || !selectedClient || isSubmitting || !isValid
							}
							fullWidth
						>
							{isSubmitting ? "Guardando..." : "Registrar Paciente"}
						</Button>
					</Grid>

					{selectedPerson && (
						<Grid item xs={12}>
							<Typography variant="body2" color="text.secondary">
								Persona seleccionada:{" "}
								<strong>
									{selectedPerson.per_names} {selectedPerson.per_surnames}
								</strong>
							</Typography>
						</Grid>
					)}

					{selectedClient && (
						<Grid item xs={12}>
							<Typography variant="body2" color="text.secondary">
								Cliente seleccionado: <strong>{selectedClient.cli_name}</strong>
							</Typography>
						</Grid>
					)}
				</Grid>
			</form>

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
