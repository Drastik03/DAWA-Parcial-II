/** biome-ignore-all lint/nursery/useUniqueElementIds: <explanation> */
/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */
import React, { useState } from "react";
import { Grid, Box, Button, FormControl, Snackbar, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import CustomTextField from "../../../../components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "../../../../components/forms/theme-elements/CustomFormLabel";
import ParentCard from "../../../../components/shared/ParentCard";
import Breadcrumb from "../../../../layouts/full/shared/breadcrumb/Breadcrumb";
import PageContainer from "../../../../components/container/PageContainer";
import { createRole } from "../../../../services/admin/rolservice";

const BCrumb = [
	{
		to: "/",
		title: "Home",
	},
	{
		title: "Registrar Rol",
	},
];

const FormUserRolRegister = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm();

	const [openSnackbar, setOpenSnackbar] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState("success");

	const registerUser = async (data) => {
		try {
			const payload = {
				rol_name: data.rol_name,
				rol_description: data.rol_description,
			};
			const res = await createRole(payload);
			if (res.result) {
				setSnackbarMessage("Rol registrado exitosamente");
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
	// admin / roles;
	return (
		<PageContainer
			title="Creación de Rol"
			description="Formulario de registro de rol"
		>
			<Breadcrumb title="Roles" items={BCrumb} />

			<ParentCard
				title="Registro de Rol"
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
							form="rol-form"
						>
							Registrar
						</Button>
					</>
				}
			>
				<Box
					component="form"
					id="rol-form"
					onSubmit={handleSubmit(registerUser)}
					noValidate
				>
					<Grid container spacing={3} mb={3}>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Nombre del Rol</CustomFormLabel>
							<CustomTextField
								fullWidth
								{...register("rol_name", { required: true })}
								error={!!errors.rol_name}
								helperText={errors.rol_name && "Campo requerido"}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Descripción del Rol</CustomFormLabel>
							<CustomTextField
								fullWidth
								{...register("rol_description", { required: true })}
								error={!!errors.rol_description}
								helperText={errors.rol_description && "Campo requerido"}
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

export default FormUserRolRegister;
