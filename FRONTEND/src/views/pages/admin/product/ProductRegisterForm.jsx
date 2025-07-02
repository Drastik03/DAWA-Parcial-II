import React, { useState } from "react";
import { Grid, Box, Button, Snackbar, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import CustomTextField from "../../../../components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "../../../../components/forms/theme-elements/CustomFormLabel";
import ParentCard from "../../../../components/shared/ParentCard";
import Breadcrumb from "../../../../layouts/full/shared/breadcrumb/Breadcrumb";
import PageContainer from "../../../../components/container/PageContainer";
// import { createProduct } from "../../../../services/admin/ProductService"; // Implement this service

const BCrumb = [
	{
		to: "/admin/productos",
		title: "Home",
	},
];

const ProductRegisterForm = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm();

	const [openSnackbar, setOpenSnackbar] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState("success");

	const registerProduct = async (data) => {
		try {
			// const res = await createProduct(data);
			// if (res.result) {
			setSnackbarMessage("Producto registrado exitosamente");
			setSnackbarSeverity("success");
			setOpenSnackbar(true);
			reset();
			// } else {
			//   throw new Error(res.message);
			// }
		} catch (error) {
			setSnackbarMessage(`Error: ${error.message}`);
			setSnackbarSeverity("error");
			setOpenSnackbar(true);
		}
	};

	return (
		<PageContainer
			title="Creación de Producto"
			description="Formulario de registro de producto"
		>
			<Breadcrumb title="Productos" items={BCrumb} />
			<ParentCard
				title="Registro de Producto"
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
							form="product-form"
						>
							Registrar
						</Button>
					</>
				}
			>
				<Box
					component="form"
					id="product-form"
					onSubmit={handleSubmit(registerProduct)}
					noValidate
				>
					<Grid container spacing={3} mb={3}>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Código del Producto</CustomFormLabel>
							<CustomTextField
								fullWidth
								{...register("pro_code", { required: true })}
								error={!!errors.pro_code}
								helperText={errors.pro_code && "Campo requerido"}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Nombre del Producto</CustomFormLabel>
							<CustomTextField
								fullWidth
								{...register("pro_name", { required: true })}
								error={!!errors.pro_name}
								helperText={errors.pro_name && "Campo requerido"}
							/>
						</Grid>
						<Grid item xs={12}>
							<CustomFormLabel>Descripción</CustomFormLabel>
							<CustomTextField
								fullWidth
								multiline
								rows={3}
								{...register("pro_description", { required: true })}
								error={!!errors.pro_description}
								helperText={errors.pro_description && "Campo requerido"}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Precio</CustomFormLabel>
							<CustomTextField
								type="number"
								fullWidth
								inputProps={{ min: 0, step: "0.01" }}
								{...register("pro_price", {
									required: true,
									min: { value: 0, message: "No puede ser negativo" },
								})}
								error={!!errors.pro_price}
								helperText={
									errors.pro_price &&
									(errors.pro_price.message || "Campo requerido")
								}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Total de Sesiones</CustomFormLabel>
							<CustomTextField
								type="number"
								fullWidth
								inputProps={{ min: 0 }}
								{...register("pro_total_sessions", {
									required: true,
									min: { value: 0, message: "No puede ser negativo" },
								})}
								error={!!errors.pro_total_sessions}
								helperText={
									errors.pro_total_sessions &&
									(errors.pro_total_sessions.message || "Campo requerido")
								}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Días de Duración</CustomFormLabel>
							<CustomTextField
								type="number"
								fullWidth
								inputProps={{ min: 0 }}
								{...register("pro_duration_days", {
									required: true,
									min: { value: 0, message: "No puede ser negativo" },
								})}
								error={!!errors.pro_duration_days}
								helperText={
									errors.pro_duration_days &&
									(errors.pro_duration_days.message || "Campo requerido")
								}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>URL de Imagen</CustomFormLabel>
							<CustomTextField
								fullWidth
								{...register("pro_image_url", { required: true })}
								error={!!errors.pro_image_url}
								helperText={errors.pro_image_url && "Campo requerido"}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>ID Tipo de Terapia</CustomFormLabel>
							<CustomTextField
								type="number"
								fullWidth
								inputProps={{ min: 0 }}
								{...register("pro_therapy_type_id", {
									required: true,
									min: { value: 0, message: "No puede ser negativo" },
								})}
								error={!!errors.pro_therapy_type_id}
								helperText={
									errors.pro_therapy_type_id &&
									(errors.pro_therapy_type_id.message || "Campo requerido")
								}
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

export default ProductRegisterForm;
