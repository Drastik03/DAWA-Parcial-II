import React, { useEffect, useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Grid,
	Autocomplete,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "../../../../context/AuthContext";

const API_BASE = "http://localhost:5000";

export default function EditPatientForm({ open, onClose, onSuccess, patient }) {
	const { user } = useAuth();

	const {
		register,
		handleSubmit,
		control,
		reset,
		setValue,
		formState: { errors },
	} = useForm();

	const [clients, setClients] = useState([]);
	const [persons, setPersons] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [resClients, resPersons] = await Promise.all([
					axios.get(`${API_BASE}/admin/client/list`, {
						headers: { tokenapp: Cookies.get("token") },
					}),
					axios.get(`${API_BASE}/admin/persons/list`, {
						headers: { tokenapp: Cookies.get("token") },
					}),
				]);
				console.log(resPersons?.data.data);
				console.log(resClients?.data?.data.data);

				setClients(resClients.data?.data.data || []);
				setPersons(resPersons.data?.data.data || []);
			} catch (err) {
				console.error("Error cargando datos:", err);
			}
		};

		fetchData();
	}, []);

	useEffect(() => {
		if (patient) {
			reset({
				pat_code: patient.pat_code || "",
				pat_medical_conditions: patient.pat_medical_conditions || "",
				pat_allergies: patient.pat_allergies || "",
				pat_blood_type: patient.pat_blood_type || "",
				pat_emergency_contact_name: patient.pat_emergency_contact_name || "",
				pat_emergency_contact_phone: patient.pat_emergency_contact_phone || "",
				pat_client_id:
					clients.find((c) => c.cli_id === patient.pat_client_id) || null,
				pat_person_id:
					persons.find((p) => p.per_id === patient.pat_person_id) || null,
			});
		}
	}, [patient, clients, persons, reset]);

	const onSubmit = async (data) => {
		try {
			const payload = {
				...data,
				pat_client_id: data.pat_client_id?.cli_id,
				pat_person_id: data.pat_person_id?.per_id,
				user_modified: user?.user?.user_login_id,
			};

			const endpoint = `${API_BASE}/clinic/patients/update/${patient.pat_id}`;

			await axios.patch(endpoint, payload, {
				headers: { tokenapp: Cookies.get("token") },
			});

			onSuccess();
			onClose();
		} catch (err) {
			console.error("Error al guardar paciente", err);
			alert("Error al guardar paciente");
		}
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth scroll="paper">
			<DialogTitle>Editar Paciente</DialogTitle>
			<DialogContent dividers>
				{/** biome-ignore lint/nursery/useUniqueElementIds: <explanation> */}
				<form id="edit-patient-form" onSubmit={handleSubmit(onSubmit)}>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<TextField
								label="Código"
								fullWidth
								value={patient?.pat_code || ""}
								InputProps={{ readOnly: true }}
								sx={{ bgcolor: "#f5f5f5" }}
							/>
						</Grid>

						<Grid item xs={12}>
							<Controller
								name="pat_person_id"
								control={control}
								rules={{ required: "Debe seleccionar una persona" }}
								render={({ field }) => (
									<Autocomplete
										{...field}
										options={persons}
										getOptionLabel={(option) =>
											`${option.per_names} ${option.per_surnames}` || ""
										}
										isOptionEqualToValue={(opt, val) =>
											opt.per_id === val?.per_id
										}
										onChange={(_, value) => field.onChange(value)}
										renderInput={(params) => (
											<TextField
												{...params}
												label="Persona"
												error={!!errors.pat_person_id}
												helperText={errors.pat_person_id?.message}
											/>
										)}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12}>
							<Controller
								name="pat_client_id"
								control={control}
								rules={{ required: "Debe seleccionar un cliente" }}
								render={({ field }) => (
									<Autocomplete
										{...field}
										options={clients}
										getOptionLabel={(option) => option.cli_name || ""}
										isOptionEqualToValue={(opt, val) =>
											opt.cli_id === val?.cli_id
										}
										onChange={(_, value) => field.onChange(value)}
										renderInput={(params) => (
											<TextField
												{...params}
												label="Cliente"
												error={!!errors.pat_client_id}
												helperText={errors.pat_client_id?.message}
											/>
										)}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Condiciones médicas"
								{...register("pat_medical_conditions")}
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Alergias"
								{...register("pat_allergies")}
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Tipo de sangre"
								{...register("pat_blood_type")}
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Contacto de emergencia (nombre)"
								{...register("pat_emergency_contact_name")}
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Contacto de emergencia (teléfono)"
								{...register("pat_emergency_contact_phone")}
							/>
						</Grid>
					</Grid>
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancelar</Button>
				<Button type="submit" form="edit-patient-form" variant="contained">
					Guardar
				</Button>
			</DialogActions>
		</Dialog>
	);
}
