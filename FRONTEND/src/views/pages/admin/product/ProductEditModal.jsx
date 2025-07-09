import React, { useEffect, useState } from "react";
import {
	Modal,
	Box,
	Grid,
	Button,
	Snackbar,
	Alert,
	Autocomplete,
	FormControl,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import CustomTextField from "../../../../components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "../../../../components/forms/theme-elements/CustomFormLabel";
import { useAuth } from "../../../../context/AuthContext";

const ProductEditModal = ({
	open,
	onClose,
	product,
	therapyOptions,
	onUpdated,
}) => {
	const theme = useTheme();
	const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
	const { user } = useAuth();
	const style = {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
		width: isSmallScreen ? "90%" : 600,
		maxHeight: "85vh",
		overflowY: "auto",
		bgcolor: "background.paper",
		boxShadow: 24,
		p: 4,
		borderRadius: 2,
	};

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm();

	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState("success");
	const [imageFile, setImageFile] = useState(null);

	useEffect(() => {
		if (product) {
			reset({
				pro_name: product.pro_name,
				pro_description: product.pro_description,
				pro_price: product.pro_price,
				pro_total_sessions: product.pro_total_sessions,
				pro_duration_days: product.pro_duration_days,
				pro_therapy_type_id: product.pro_therapy_type_id || null,
			});
			setImageFile(null);
		}
	}, [product, reset]);

	const onSubmit = async (data) => {
		try {
			const formData = new FormData();
			Object.entries(data).forEach(([key, value]) => {
				formData.append(key, value);
			});
			if (imageFile) formData.append("file", imageFile);
			formData.append("pro_id", product.pro_id);
			formData.append("user_process", user.user.user_login_id);
			formData.append("pro_code", product.pro_code);
			formData.append("pro_image_url", product.pro_image_url);

			const res = await editProduct(formData);

			if (res.result) {
				setSnackbarMessage("Producto actualizado correctamente");
				setSnackbarSeverity("success");
				setSnackbarOpen(true);
				onUpdated();
				onClose();
			} else {
				setSnackbarMessage(res.message || "Error al actualizar");
				setSnackbarSeverity("error");
				setSnackbarOpen(true);
			}
		} catch (error) {
			setSnackbarMessage(error.message);
			setSnackbarSeverity("error");
			setSnackbarOpen(true);
		}
	};

	return (
		<Modal open={open} onClose={onClose}>
			<Box
				sx={style}
				component="form"
				noValidate
				onSubmit={handleSubmit(onSubmit)}
			>
				<Grid container spacing={2}>
					<Grid item xs={12}>
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

					<Grid item xs={12} sm={4}>
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

					<Grid item xs={12} sm={4}>
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

					<Grid item xs={12} sm={4}>
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

					<Grid item xs={12}>
						<CustomFormLabel>Imagen del Producto</CustomFormLabel>
						<input
							type="file"
							accept="image/*"
							onChange={(e) => setImageFile(e.target.files[0])}
							style={{ width: "100%", padding: "10px", borderRadius: "8px" }}
						/>
					</Grid>

					<Grid item xs={12}>
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
											option.tht_id === (value?.tht_id ?? value)
										}
										onChange={(_, newValue) =>
											field.onChange(newValue ? newValue.tht_id : null)
										}
										value={
											therapyOptions.find(
												(opt) => opt.tht_id === field.value,
											) || null
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

					<Grid item xs={12} sx={{ mt: 3, textAlign: "right" }}>
						<Button
							variant="contained"
							color="error"
							onClick={onClose}
							sx={{ mr: 2 }}
						>
							Cancelar
						</Button>
						<Button variant="contained" color="primary" type="submit">
							Guardar Cambios
						</Button>
					</Grid>
				</Grid>

				<Snackbar
					open={snackbarOpen}
					autoHideDuration={4000}
					onClose={() => setSnackbarOpen(false)}
					anchorOrigin={{ vertical: "top", horizontal: "center" }}
				>
					<Alert
						onClose={() => setSnackbarOpen(false)}
						severity={snackbarSeverity}
						variant="filled"
						sx={{ width: "100%" }}
					>
						{snackbarMessage}
					</Alert>
				</Snackbar>
			</Box>
		</Modal>
	);
};

export default ProductEditModal;
