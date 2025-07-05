/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
	Modal,
	Box,
	Typography,
	Stack,
	TextField,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Autocomplete,
	FormControl,
	Grid,
} from "@mui/material";
import { useFetch } from "../../../hooks/useFetch";
import CustomTextField from "../../forms/theme-elements/CustomTextField";
import { Controller, useForm } from "react-hook-form";
import CustomFormLabel from "../../forms/theme-elements/CustomFormLabel";

const style = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: 600,
	bgcolor: "background.paper",
	borderRadius: 2,
	boxShadow: 24,
	p: 4,
};

export const EditPersonModal = ({
	openEdit,
	handleEditClose,
	onSave,
	handleEditSave,
	handleEditChange,
	editData = {},
}) => {
	const [confirmOpen, setConfirmOpen] = useState(false);
	const { data: genreData } = useFetch(
		"http://localhost:5000/admin/Person_genre/list",
	);
	const { data: maritalData } = useFetch(
		"http://localhost:5000/admin/Marital_status/list",
	);
	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm();

	const genres = Array.isArray(genreData?.data) ? genreData.data : [];
	const maritals = Array.isArray(maritalData?.data) ? maritalData.data : [];

	useEffect(() => {
		reset(editData);
	}, [editData, reset]);

	useEffect(() => {
		reset(editData);
	}, [editData, reset]);

	const handleSaveClick = () => {
		setConfirmOpen(true);
	};

	const handleConfirmClose = () => {
		setConfirmOpen(false);
	};

	const onSubmit = (data) => {
		setConfirmOpen(false);
		onSave(data);
	};
	return (
		<>
			<Modal open={openEdit} onClose={handleEditClose}>
				<Box sx={style} component="form" onSubmit={handleSubmit(onSubmit)}>
					<Typography variant="h6" component="h2" mb={2}>
						Editar Persona
					</Typography>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Identificacion (CI)</CustomFormLabel>
							<CustomTextField
								{...register("per_identification", { required: true })}
								fullWidth
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Email</CustomFormLabel>
							<CustomTextField
								{...register("per_mail", { required: true })}
								fullWidth
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Nombres</CustomFormLabel>
							<CustomTextField
								{...register("per_names", { required: true })}
								fullWidth
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Apellidos</CustomFormLabel>
							<CustomTextField
								{...register("per_surnames", { required: true })}
								fullWidth
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Género</CustomFormLabel>
							<FormControl fullWidth error={!!errors.per_genre_id}>
								<Controller
									name="per_genre_id"
									control={control}
									rules={{ required: true }}
									render={({ field }) => (
										<Autocomplete
											options={genres}
											getOptionLabel={(option) => option.genre_name || ""}
											value={genres.find((g) => g.id === field.value) || null}
											onChange={(_, newValue) =>
												field.onChange(newValue ? newValue.id : "")
											}
											renderInput={(params) => (
												<CustomTextField
													{...params}
													error={!!errors.per_genre_id}
													helperText={errors.per_genre_id && "Campo requerido"}
												/>
											)}
										/>
									)}
								/>
							</FormControl>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Estado civil</CustomFormLabel>
							<FormControl fullWidth error={!!errors.per_marital_status_id}>
								<Controller
									name="per_marital_status_id"
									control={control}
									rules={{ required: true }}
									render={({ field }) => (
										<Autocomplete
											options={maritals}
											getOptionLabel={(option) => option.status_name || ""}
											value={maritals.find((m) => m.id === field.value) || null}
											onChange={(_, newValue) =>
												field.onChange(newValue ? newValue.id : "")
											}
											renderInput={(params) => (
												<CustomTextField
													{...params}
													error={!!errors.per_marital_status_id}
													helperText={
														errors.per_marital_status_id && "Campo requerido"
													}
												/>
											)}
										/>
									)}
								/>
							</FormControl>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Fecha de Nacimiento</CustomFormLabel>
							<CustomTextField
								type="date"
								{...register("per_birth_date", { required: true })}
								fullWidth
								InputLabelProps={{ shrink: true }}
							/>
						</Grid>
					</Grid>
					<Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
						<Button onClick={handleEditClose} color="primary">
							Cancelar
						</Button>
						<Button type="submit" color="primary" variant="contained">
							Guardar
						</Button>
					</Stack>
				</Box>
			</Modal>

			<Dialog open={confirmOpen} onClose={handleConfirmClose}>
				<DialogTitle>Confirmar cambios</DialogTitle>
				<DialogContent>
					<DialogContentText>
						¿Estás seguro que deseas guardar los cambios?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleConfirmClose} color="error">
						Cancelar
					</Button>
					<Button
						onClick={handleSubmit(onSubmit)}
						color="primary"
						variant="contained"
					>
						Confirmar
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};
