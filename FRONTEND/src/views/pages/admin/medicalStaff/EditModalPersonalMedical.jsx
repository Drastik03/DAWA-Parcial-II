import React, { useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Grid,
	TextField,
	FormControl,
	Autocomplete,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { updatePersonalMedical } from "../../../../services/admin/personalmedicalservice";
import { useAuth } from "../../../../context/AuthContext";

const EditModalPersonalMedical = ({
	open,
	onClose,
	selectedData,
	onUpdate,
	personsData = [],
	medicalTypes = [],
}) => {
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			med_person_id: "",
			med_type_id: "",
			med_specialty: "",
		},
	});
	const { user } = useAuth();

	useEffect(() => {
		if (selectedData) {
			reset({
				med_person_id: selectedData.med_person_id ?? "",
				med_type_id: selectedData.med_type_id ?? "",
				med_specialty: selectedData.med_specialty ?? "",
				user_modified: user.user.user_login_id,
			});
		}
	}, [selectedData, reset, user.user.user_login_id]);

	const onSubmit = async (formData) => {
		if (!selectedData?.med_id) return;

		const response = await updatePersonalMedical(selectedData.med_id, formData);

		if (response.result) {
			onUpdate();
			onClose();
		} else {
			alert(response.message || "Error al actualizar");
		}
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
			<DialogTitle>Editar Personal Médico</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent dividers>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<FormControl fullWidth error={!!errors.med_person_id}>
								<Controller
									name="med_person_id"
									control={control}
									rules={{ required: "Seleccione una persona" }}
									render={({ field }) => (
										<Autocomplete
											options={personsData}
											getOptionLabel={(option) =>
												option.per_names && option.per_surnames
													? `${option.per_names} ${option.per_surnames}`
													: ""
											}
											isOptionEqualToValue={(option, value) =>
												option.per_id === value
											}
											value={
												personsData.find((p) => p.per_id === field.value) ||
												null
											}
											onChange={(_, newValue) =>
												field.onChange(newValue ? newValue.per_id : "")
											}
											renderInput={(params) => (
												<TextField
													{...params}
													label="Persona"
													variant="outlined"
													error={!!errors.med_person_id}
													helperText={errors.med_person_id?.message}
												/>
											)}
										/>
									)}
								/>
							</FormControl>
						</Grid>

						<Grid item xs={12}>
							<FormControl fullWidth error={!!errors.med_type_id}>
								<Controller
									name="med_type_id"
									control={control}
									rules={{ required: "Tipo de personal médico requerido" }}
									render={({ field }) => (
										<Autocomplete
											options={medicalTypes}
											getOptionLabel={(option) => option.mpt_name || ""}
											isOptionEqualToValue={(option, value) =>
												option.mpt_id === value
											}
											value={
												medicalTypes.find((t) => t.mpt_id === field.value) ||
												null
											}
											onChange={(_, newValue) =>
												field.onChange(newValue ? newValue.mpt_id : "")
											}
											renderInput={(params) => (
												<TextField
													{...params}
													label="Tipo de Personal Médico"
													variant="outlined"
													error={!!errors.med_type_id}
													helperText={errors.med_type_id?.message}
												/>
											)}
										/>
									)}
								/>
							</FormControl>
						</Grid>

						<Grid item xs={12}>
							<Controller
								name="med_specialty"
								control={control}
								rules={{ required: "Especialidad requerida" }}
								render={({ field }) => (
									<TextField
										{...field}
										label="Especialidad"
										fullWidth
										variant="outlined"
										error={!!errors.med_specialty}
										helperText={errors.med_specialty?.message}
									/>
								)}
							/>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>Cancelar</Button>
					<Button type="submit" variant="contained" color="primary">
						Guardar Cambios
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default EditModalPersonalMedical;
