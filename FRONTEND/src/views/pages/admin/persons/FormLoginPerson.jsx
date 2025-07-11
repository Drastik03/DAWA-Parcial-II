import React, { useState } from "react";
import {
	Grid,
	Box,
	Button,
	FormControl,
	Snackbar,
	Alert,
	Autocomplete,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import CustomTextField from "../../../../components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "../../../../components/forms/theme-elements/CustomFormLabel";
import ParentCard from "../../../../components/shared/ParentCard";
import Breadcrumb from "../../../../layouts/full/shared/breadcrumb/Breadcrumb";
import PageContainer from "../../../../components/container/PageContainer";
import { useFetch } from "../../../../hooks/useFetch";
import { useAuth } from "../../../../context/AuthContext";
import { createPerson } from "../../../../services/personsService";

const BCrumb = [
	{
		to: "/admin/persons/list",
		title: "Home",
	},
];

const FormLoginPerson = () => {
	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm();

	const { user } = useAuth();
	const [openSnackbar, setOpenSnackbar] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState("success");

	const { data: genreData } = useFetch(
		`${import.meta.env.VITE_API_URL}/admin/Person_genre/list`,
	);

	const { data: maritalData } = useFetch(
		`${import.meta.env.VITE_API_URL}/admin/Marital_status/list`,
	);
	  
	const genres = Array.isArray(genreData?.data) ? genreData.data : [];
	const maritals = Array.isArray(maritalData?.data) ? maritalData.data : [];

	const registerPerson = async (data) => {
		try {
			const payload = {
				...data,
				user_process: user.user.user_login_id,
			};
			const res = await createPerson(payload);
			if (res.result) {
				setSnackbarMessage("Persona registrada exitosamente");
				setSnackbarSeverity("success");
				setOpenSnackbar(true);
				reset();
			} else {
				throw new Error(res.message);
			}
		} catch (error) {
			setSnackbarMessage(`Error: ${error.message}`);
			setSnackbarSeverity("error");
			setOpenSnackbar(true);
		}
	};

	return (
		<PageContainer title="Creación" description="Listado de personas">
			<Breadcrumb title="Personas" items={BCrumb} />
			<ParentCard
				title="Registro de Persona"
				footer={
					<>
						<Button
							variant="contained"
							color="error"
							sx={{ mr: 1 }}
							onClick={() => reset()}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							variant="contained"
							color="primary"
							form="person-form"
						>
							Registrar
						</Button>
					</>
				}
			>
				{/** biome-ignore lint/nursery/useUniqueElementIds: <explanation> */}
				<Box
					component="form"
					id="person-form"
					onSubmit={handleSubmit(registerPerson)}
					noValidate
				>
					<Grid container spacing={3} mb={3}>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Identificación</CustomFormLabel>
							<CustomTextField
								fullWidth
								{...register("per_identification", { required: true })}
								error={!!errors.per_identification}
								helperText={errors.per_identification && "Campo requerido"}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Nombres</CustomFormLabel>
							<CustomTextField
								fullWidth
								{...register("per_names", { required: true })}
								error={!!errors.per_names}
								helperText={errors.per_names && "Campo requerido"}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Apellidos</CustomFormLabel>
							<CustomTextField
								fullWidth
								{...register("per_surnames", { required: true })}
								error={!!errors.per_surnames}
								helperText={errors.per_surnames && "Campo requerido"}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Fecha de Nacimiento</CustomFormLabel>
							<CustomTextField
								type="date"
								fullWidth
								{...register("per_birth_date", { required: true })}
								error={!!errors.per_birth_date}
								helperText={errors.per_birth_date && "Campo requerido"}
								InputLabelProps={{ shrink: true }}
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
							<CustomFormLabel>Estado Civil</CustomFormLabel>
							<FormControl fullWidth error={!!errors.per_marital_status_id}>
								<Controller
									name="per_marital_status_id"
									control={control}
									rules={{ required: true }}
									render={({ field }) => (
										<Autocomplete
											options={maritals}
											getOptionLabel={(option) => option.status_name || ""}
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
							<CustomFormLabel>País</CustomFormLabel>
							<CustomTextField
								fullWidth
								{...register("per_country", { required: true })}
								error={!!errors.per_country}
								helperText={errors.per_country && "Campo requerido"}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Ciudad</CustomFormLabel>
							<CustomTextField
								fullWidth
								{...register("per_city", { required: true })}
								error={!!errors.per_city}
								helperText={errors.per_city && "Campo requerido"}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Dirección</CustomFormLabel>
							<CustomTextField
								fullWidth
								{...register("per_address", { required: true })}
								error={!!errors.per_address}
								helperText={errors.per_address && "Campo requerido"}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Teléfono</CustomFormLabel>
							<CustomTextField
								fullWidth
								{...register("per_phone", { required: true })}
								error={!!errors.per_phone}
								helperText={errors.per_phone && "Campo requerido"}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Correo</CustomFormLabel>
							<CustomTextField
								type="email"
								fullWidth
								{...register("per_mail", { required: true })}
								error={!!errors.per_mail}
								helperText={errors.per_mail && "Campo requerido"}
							/>
						</Grid>
					</Grid>
				</Box>

				<Snackbar
					open={openSnackbar}
					autoHideDuration={5000}
					onClose={() => setOpenSnackbar(false)}
					anchorOrigin={{ vertical: "top", horizontal: "center" }}
				>
					<Alert
						onClose={() => setOpenSnackbar(false)}
						severity={snackbarSeverity}
						variant="filled"
						sx={{ width: "100%" }}
					>
						{snackbarMessage}
					</Alert>
				</Snackbar>
			</ParentCard>
		</PageContainer>
	);
};

export default FormLoginPerson;
