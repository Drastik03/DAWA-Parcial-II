import React from "react";
import {
	Grid,
	TextField,
	Button,
	Snackbar,
	Alert,
	Typography,
	Autocomplete,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "../../../../context/AuthContext";
import { useFetch } from "../../../../hooks/useFetch";

const API_BASE = "http://localhost:5000/";

const AddPatientAllergyForm = ({ patientId, onSuccess }) => {
	const {
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			pa_allergy_id: "",
			pa_reaction_description: "",
		},
	});

	const { user } = useAuth();

	const [alert, setAlert] = React.useState({
		open: false,
		message: "",
		severity: "success",
	});

	const { data: allergyData } = useFetch(`${API_BASE}catalog/allergy/list`);
	const allergies = Array.isArray(allergyData?.data) ? allergyData.data : [];
	console.log(allergies);

	const onSubmit = async (data) => {
		try {
			const payload = {
				...data,
				pa_patient_id: parseInt(patientId),
				user_created: user.user.user_login_id,
			};

			const res = await axios.post(
				`${API_BASE}clinic/patient-allergy/add`,
				payload,
				{
					headers: { tokenapp: Cookies.get("token") },
				},
			);

			if (res.data.result) {
				setAlert({
					open: true,
					message: "Alergia registrada correctamente",
					severity: "success",
				});
				onSuccess?.();
				reset();
			} else {
				setAlert({
					open: true,
					message: res.data.message,
					severity: "error",
				});
			}
		} catch (err) {
			console.error(err);
			setAlert({
				open: true,
				message: "Error al registrar la alergia",
				severity: "error",
			});
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Typography variant="h6" gutterBottom>
				Registrar Alergia
			</Typography>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={6}>
					<Controller
						name="pa_allergy_id"
						control={control}
						rules={{ required: "Seleccione una alergia" }}
						render={({ field }) => (
							<Autocomplete
								options={allergies}
								getOptionLabel={(option) => option?.al_name || ""}
								isOptionEqualToValue={(option, value) => option.al_id === value}
								value={allergies.find((a) => a.al_id === field.value) || null}
								onChange={(_, newValue) =>
									field.onChange(newValue ? newValue.al_id : "")
								}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Alergia"
										fullWidth
										error={!!errors.pa_allergy_id}
										helperText={errors.pa_allergy_id?.message}
									/>
								)}
							/>
						)}
					/>
				</Grid>

				<Grid item xs={12}>
					<Controller
						name="pa_reaction_description"
						control={control}
						rules={{ required: "Descripción requerida" }}
						render={({ field }) => (
							<TextField
								{...field}
								label="Descripción de la reacción"
								fullWidth
								multiline
								rows={3}
								error={!!errors.pa_reaction_description}
								helperText={errors.pa_reaction_description?.message}
							/>
						)}
					/>
				</Grid>

				<Grid item xs={12}>
					<Button type="submit" variant="contained" fullWidth>
						Registrar Alergia
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
					onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
				>
					{alert.message}
				</Alert>
			</Snackbar>
		</form>
	);
};

export default AddPatientAllergyForm;
