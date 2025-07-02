/** biome-ignore-all lint/nursery/useUniqueElementIds: <explanation> */
import React, { useState } from "react";
import { Grid, Box, Button, FormControl, Snackbar, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import CustomTextField from "../../../../components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "../../../../components/forms/theme-elements/CustomFormLabel";
import ParentCard from "../../../../components/shared/ParentCard";
import Breadcrumb from "../../../../layouts/full/shared/breadcrumb/Breadcrumb";
import PageContainer from "../../../../components/container/PageContainer";
import { createModule } from "../../../../services/admin/ModuleService";
import CustomSelect from "../../../../components/forms/theme-elements/CustomSelect";

const BCrumb = [
	{
		to: "/admin/modulos",
		title: "Home",
	},
];

const FormModuleRegister = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm();

	const [openSnackbar, setOpenSnackbar] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState("success");

	const registerModule = async (data) => {
		try {
			const res = await createModule(data);
			if (res.result) {
				setSnackbarMessage("Módulo registrado exitosamente");
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
			title="Creación de Módulo"
			description="Formulario de registro de módulo"
		>
			<Breadcrumb title="Módulos" items={BCrumb} />
			<ParentCard
				title="Registro de Módulo"
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
							form="module-form"
						>
							Registrar
						</Button>
					</>
				}
			>
				<Box
					component="form"
					id="module-form"
					onSubmit={handleSubmit(registerModule)}
					noValidate
				>
					<Grid container spacing={3} mb={3}>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Nombre del Módulo</CustomFormLabel>
							<CustomTextField
								fullWidth
								{...register("mod_name", { required: true })}
								error={!!errors.module_name}
								helperText={errors.module_name && "Campo requerido"}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Descripción del Módulo</CustomFormLabel>
							<CustomTextField
								fullWidth
								{...register("mod_description", { required: true })}
								error={!!errors.module_description}
								helperText={errors.module_description && "Campo requerido"}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Orden de visualizacion</CustomFormLabel>
							<CustomTextField
								type="number"
								fullWidth
								inputProps={{ min: 1 }}
								{...register("mod_order", {
									required: true,
									min: {
										value: 1,
										message: "No puede ser menor que 1",
									},
								})}
								error={!!errors.module_order}
								helperText={
									errors.module_order &&
									(errors.module_order.message || "Campo requerido")
								}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Nombre del icono</CustomFormLabel>
							<CustomTextField
								fullWidth
								{...register("mod_icon_name", { required: true })}
								error={!!errors.module_icon_name}
								helperText={errors.module_icon_name && "Campo requerido"}
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

export default FormModuleRegister;
