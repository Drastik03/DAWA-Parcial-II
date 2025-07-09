import React, { useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Grid,
	TextField,
	Autocomplete,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useFetch } from "../../../../hooks/useFetch";

const API_BASE = "http://localhost:5000/";

const EditModalPatientAllergy = ({
	open,
	onClose,
	defaultValues,
	onSubmit,
}) => {
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			pa_allergy_id: "",
			pa_reaction_description: "",
		},
	});

	const { data: allergyData } = useFetch(`${API_BASE}catalog/allergy/list`);
	const allergies = Array.isArray(allergyData?.data) ? allergyData.data : [];

	useEffect(() => {
		if (defaultValues) {
			reset({
				pa_patient_id: defaultValues.pa_patient_id,
				pa_allergy_id: defaultValues.pa_allergy_id || "",
				pa_reaction_description: defaultValues.pa_reaction_description || "",
			});
		}
	}, [defaultValues, reset]);

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Editar Alergia</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent dividers>
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
										isOptionEqualToValue={(option, value) =>
											option.al_id === value
										}
										value={
											allergies.find((a) => a.al_id === field.value) || null
										}
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
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>Cancelar</Button>
					<Button type="submit" variant="contained" color="primary">
						Guardar
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default EditModalPatientAllergy;
