/** biome-ignore-all lint/nursery/useUniqueElementIds: <explanation> */
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
import { createUser } from "../../../../services/userService";
const BCrumb = [
	{
		to: "/admin/users/list",
		title: "Home",
	},
];

const FormUserRegister = () => {
	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm();

	const [openSnackbar, setOpenSnackbar] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState("success");

	const { data } = useFetch(`${import.meta.env.VITE_API_URL}/admin/persons/list`);
	const persons = Array.isArray(data?.data) ? data.data : [];

	const registerUser = async (data) => {
		try {
			const payload = {
				...data,
			};
			const res = await createUser(payload);
			if (res.result) {
				setSnackbarMessage("Usuario registrado exitosamente");
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
		<PageContainer
			title="Creación de Usuario"
			description="Formulario de registro de usuario"
		>
			<Breadcrumb title="Usuarios" items={BCrumb} />
			<ParentCard
				title="Registro de Usuario"
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
							form="user-form"
						>
							Registrar
						</Button>
					</>
				}
			>
				<Box
					component="form"
					id="user-form"
					onSubmit={handleSubmit(registerUser)}
					noValidate
				>
					<Grid container spacing={3} mb={3}>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Identificación (CI)</CustomFormLabel>
							<CustomTextField
								fullWidth
								{...register("person_ci", { required: true })}
								error={!!errors.person_ci}
								helperText={errors.person_ci && "Campo requerido"}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Persona</CustomFormLabel>
							<FormControl fullWidth error={!!errors.person_id}>
								<Controller
									name="person_id"
									control={control}
									rules={{ required: true }}
									render={({ field }) => (
										<Autocomplete
											options={persons}
											getOptionLabel={(option) =>
												`${option?.per_names ?? ""} ${option?.per_surnames ?? ""}`.trim()
											}
											onChange={(_, newValue) =>
												field.onChange(newValue ? newValue.per_id : "")
											}
											renderInput={(params) => (
												<CustomTextField
													{...params}
													error={!!errors.person_id}
													helperText={errors.person_id && "Campo requerido"}
												/>
											)}
										/>
									)}
								/>
							</FormControl>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Correo</CustomFormLabel>
							<CustomTextField
								type="email"
								fullWidth
								{...register("person_mail", { required: true })}
								error={!!errors.person_mail}
								helperText={errors.person_mail && "Campo requerido"}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Contraseña</CustomFormLabel>
							<CustomTextField
								type="password"
								fullWidth
								{...register("person_password", { required: true })}
								error={!!errors.person_password}
								helperText={errors.person_password && "Campo requerido"}
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

export default FormUserRegister;
