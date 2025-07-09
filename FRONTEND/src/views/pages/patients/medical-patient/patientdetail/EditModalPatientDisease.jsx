import React, { useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Grid,
	TextField,
	FormControlLabel,
	Checkbox,
	Autocomplete,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useFetch } from "../../../../../hooks/useFetch";

const API_BASE = "http://localhost:5000/";

const EditModalPatientDisease = ({
	open,
	onClose,
	defaultValues,
	onSubmit,
}) => {
	const { control, handleSubmit, reset } = useForm({
		defaultValues: {
			pd_disease_id: "",
			pd_notes: "",
			pd_is_current: false,
		},
	});

	const { data: diseasesData } = useFetch(
		`${API_BASE}catalog/disease-type/list`,
	);
	const diseases = Array.isArray(diseasesData?.data) ? diseasesData?.data : [];

	useEffect(() => {
		if (defaultValues) {
			reset({
				...defaultValues,
			});
		}
	}, [defaultValues, reset]);

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Editar Enfermedad del Paciente</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent dividers>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<Controller
								name="pd_disease_id"
								control={control}
								rules={{ required: "Seleccione una enfermedad" }}
								render={({ field, fieldState }) => {
									const selectedOption =
										diseases.find((d) => d.dis_id === field.value) || null;

									return (
										<Autocomplete
											options={diseases}
											getOptionLabel={(option) => option.dis_name || ""}
											value={selectedOption}
											onChange={(_, newValue) =>
												field.onChange(newValue ? newValue.dis_id : "")
											}
											renderInput={(params) => (
												<TextField
													{...params}
													label="Enfermedad"
													error={!!fieldState.error}
													helperText={fieldState.error?.message}
													fullWidth
												/>
											)}
										/>
									);
								}}
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

export default EditModalPatientDisease;
