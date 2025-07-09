import React from "react";
import {
	Grid,
	TextField,
	Button,
	Checkbox,
	FormControlLabel,
	Snackbar,
	Alert,
	Typography,
	Autocomplete,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "../../../../../context/AuthContext";
import { useFetch } from "../../../../../hooks/useFetch";

const API_BASE = "http://localhost:5000/";

const AddPatientDiseaseForm = ({ patientId, onSuccess }) => {
	const {
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			pd_disease_id: "",
			pd_notes: "",
			pd_is_current: false,
		},
	});

	const { user } = useAuth();

	const [alert, setAlert] = React.useState({
		open: false,
		message: "",
		severity: "success",
	});

	const onSubmit = async (data) => {
		try {
			const payload = {
				...data,
				pd_patient_id: parseInt(patientId),
				user_created: user.user.user_login_id,
			};
			console.log(
				"Enviando a:",
				`http://localhost:5000/clinic/patient-disease/add`,
				payload,
			);

			const res = await axios.post(
				`http://localhost:5000/clinic/patient-disease/add`,
				payload,
				{ headers: { tokenapp: Cookies.get("token") } },
			);
			if (res.result) {
				setAlert({
					open: true,
					message: "Enfermedad registrada correctamente",
					severity: "success",
				});
				onSuccess?.();
				reset();
			}
		} catch (err) {
			console.error(err);
			setAlert({
				open: true,
				message:
					err?.response?.data?.message || "Error al registrar la enfermedad",
				severity: "error",
			});
		}
	};
	const { data: diseasesData } = useFetch(
		"http://localhost:5000/catalog/disease-type/list",
	);
	const diseases = Array.isArray(diseasesData?.data)
		? diseasesData?.data
		: [];
	console.log(diseasesData);
	console.log(diseases);


	return (
		<>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Typography variant="h6" gutterBottom>
					Registrar Enfermedad del Paciente
				</Typography>
				<Grid container spacing={2}>
					<Grid item xs={12} sm={6}>
						<Controller
							name="pd_disease_id"
							control={control}
							rules={{ required: "Seleccione una enfermedad" }}
							render={({ field }) => (
								<Autocomplete
									options={diseases}
									getOptionLabel={(option) => option?.dis_name ?? ""}
									isOptionEqualToValue={(option, value) =>
										option.dis_id === value
									}
									value={
										diseases.find((d) => d.dis_id === field.value) || null
									}
									onChange={(_, newValue) =>
										field.onChange(newValue ? newValue.dis_id : "")
									}
									renderInput={(params) => (
										<TextField
											{...params}
											label="Enfermedad"
											error={!!errors.pd_disease_id}
											helperText={errors.pd_disease_id?.message}
											fullWidth
										/>
									)}
								/>
							)}
						/>
					</Grid>

					<Grid item xs={12}>
						<Controller
							name="pd_notes"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Notas"
									fullWidth
									multiline
									rows={3}
								/>
							)}
						/>
					</Grid>

					<Grid item xs={12}>
						<Controller
							name="pd_is_current"
							control={control}
							render={({ field }) => (
								<FormControlLabel
									control={
										<Checkbox
											{...field}
											checked={field.value}
											onChange={(e) => field.onChange(e.target.checked)}
										/>
									}
									label="¿Enfermedad actual?"
								/>
							)}
						/>
					</Grid>

					<Grid item xs={12}>
						<Button type="submit" variant="contained" fullWidth>
							Registrar Enfermedad
						</Button>
					</Grid>
				</Grid>

				<Snackbar
					open={alert.open}
					autoHideDuration={3000}
					onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
					anchorOrigin={{ vertical: "top", horizontal: "center" }}
				>
					<Alert
						severity={alert.severity}
						onClose={() => setAlert({ ...alert, open: false })}
					>
						{alert.message}
					</Alert>
				</Snackbar>
			</form>
		</>
	);
};

export default AddPatientDiseaseForm;
