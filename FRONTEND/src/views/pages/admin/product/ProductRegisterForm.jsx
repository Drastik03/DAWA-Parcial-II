/** biome-ignore-all lint/nursery/useUniqueElementIds: <explanation> */
import React, { useState } from "react";
import {
	Grid,
	Box,
	Button,
	Snackbar,
	Alert,
	Autocomplete,
	FormControl,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import CustomTextField from "../../../../components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "../../../../components/forms/theme-elements/CustomFormLabel";
import ParentCard from "../../../../components/shared/ParentCard";
import Breadcrumb from "../../../../layouts/full/shared/breadcrumb/Breadcrumb";
import PageContainer from "../../../../components/container/PageContainer";
import { useFetch } from "../../../../hooks/useFetch";
import { createProduct } from "../../../../services/admin/productService";
import { useAuth } from "../../../../context/AuthContext";

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
		control,
		formState: { errors },
		reset,
	} = useForm();

	const [openSnackbar, setOpenSnackbar] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState("success");
	const { data } = useFetch(
		`${import.meta.env.VITE_API_URL}/admin/therapy-type/list`,
	);
	const therapyOptions = data?.data || [];

	console.log(data?.data);
	const [imageFile, setImageFile] = useState(null);
	const { user } = useAuth();

	const registerProduct = async (data) => {
		try {
			const formData = new FormData();
			formData.append("user_created", user.user.user_login_id);
			Object.entries(data).forEach(([key, value]) => {
				if (value?.ext_id) {
					formData.append("pro_therapy_type_id", value.ext_id);
				} else {
					formData.append(key, value);
				}
			});

			if (imageFile) {
				formData.append("file", imageFile);
			}

			const res = await createProduct(formData);

			if (res.result) {
				setSnackbarMessage("Producto registrado exitosamente");
				setSnackbarSeverity("success");
				setOpenSnackbar(true);
				reset();
				setImageFile(null);
			} else {
				setSnackbarMessage(`Error: ${res.message || "No se pudo registrar"}`);
				setSnackbarSeverity("error");
				setOpenSnackbar(true);
			}
		} catch (error) {
			console.error("Error al registrar producto:", error);
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
							<CustomFormLabel>Imagen del Producto</CustomFormLabel>
							<input
								name="file"
								type="file"
								accept="image/*"
								onChange={(e) => setImageFile(e.target.files[0])}
								style={{
									background: "#fff",
									padding: "10px",
									borderRadius: "8px",
									width: "100%",
								}}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Tipo de Terapia</CustomFormLabel>
							<FormControl fullWidth error={!!errors.pro_therapy_type_id}>
								<Controller
									name="pro_therapy_type_id"
									control={control}
									rules={{ required: true }}
									render={({ field }) => (
										<Autocomplete
											options={therapyOptions}
											getOptionLabel={(option) => option.tht_name || ""}
											isOptionEqualToValue={(option, value) =>
												option.tht_id === value.tht_id
											}
											onChange={(_, newValue) =>
												field.onChange(newValue ? newValue.tht_id : null)
											}
											renderInput={(params) => (
												<CustomTextField
													{...params}
													error={!!errors.pro_therapy_type_id}
													helperText={
														errors.pro_therapy_type_id && "Campo requerido"
													}
												/>
											)}
										/>
									)}
								/>
							</FormControl>
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
