import React, { useState } from "react";
import {
	Grid,
	Box,
	Button,
	Snackbar,
	Alert,
	FormControl,
	Autocomplete,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import CustomTextField from "../../../../components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "../../../../components/forms/theme-elements/CustomFormLabel";
import ParentCard from "../../../../components/shared/ParentCard";
import Breadcrumb from "../../../../layouts/full/shared/breadcrumb/Breadcrumb";
import PageContainer from "../../../../components/container/PageContainer";
import { useFetch } from "../../../../hooks/useFetch";
import { insertMenu } from "../../../../services/admin/menuservice";

const BCrumb = [{ to: "/", title: "Home" }, { title: "Registrar Menú" }];

const FormRegisterMenu = () => {
	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm();

	const [openSnackbar, setOpenSnackbar] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState("success");

	const { data: modulesData } = useFetch("http://localhost:5000/Module/list");
	const { data: menusData } = useFetch("http://localhost:5000/Menu/list");

	const modules = Array.isArray(modulesData) ? modulesData : [];
	const menus = Array.isArray(menusData) ? menusData : [];

	const onSubmit = async (data) => {
		try {
			console.log("Payload:", data);
			const payload = {
				...data,
				menu_parent_id: data.menu_parent_id ?? null,
			};
			delete payload.mod_id;
			console.log(data);

			const res = await insertMenu(payload);
			if (res.result) {
				setSnackbarMessage("Menú registrado exitosamente");
				setSnackbarSeverity("success");
				setOpenSnackbar(true);
				reset();
			} else {
				throw new Error(res.message || "Error al registrar menú");
			}
		} catch (error) {
			setSnackbarMessage(`Error: ${error.message}`);
			setSnackbarSeverity("error");
			setOpenSnackbar(true);
		}
	};

	return (
		<PageContainer
			title="Registrar Menú"
			description="Formulario para registrar un nuevo menú"
		>
			<Breadcrumb title="Registrar Menú" items={BCrumb} />
			<ParentCard
				title="Registrar Menú"
				footer={
					<>
						<Button variant="contained" color="error" onClick={() => reset()}>
							Cancelar
						</Button>
						<Button
							type="submit"
							variant="contained"
							color="primary"
							form="register-menu-form"
						>
							Registrar
						</Button>
					</>
				}
			>
				<Box
					component="form"
					id="register-menu-form"
					onSubmit={handleSubmit(onSubmit)}
					noValidate
				>
					<Grid container spacing={3} mb={3}>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Nombre del Menú</CustomFormLabel>
							<FormControl fullWidth error={!!errors.menu_name}>
								<Controller
									name="menu_name"
									control={control}
									rules={{ required: true }}
									render={({ field }) => (
										<CustomTextField
											{...field}
											error={!!errors.menu_name}
											helperText={errors.menu_name && "Campo requerido"}
										/>
									)}
								/>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Orden</CustomFormLabel>
							<FormControl fullWidth error={!!errors.menu_order}>
								<Controller
									name="menu_order"
									control={control}
									rules={{
										required: true,
										valueAsNumber: true,
										min: 1,
									}}
									render={({ field }) => (
										<CustomTextField
											{...field}
											type="number"
											error={!!errors.menu_order}
											helperText={
												errors.menu_order && "Campo requerido (mínimo 1)"
											}
										/>
									)}
								/>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Module</CustomFormLabel>
							<FormControl fullWidth error={!!errors.mod_id}>
								<Controller
									name="menu_module_id"
									control={control}
									rules={{ required: true }}
									render={({ field }) => (
										<Autocomplete
											options={modules}
											getOptionLabel={(option) => option.mod_name || ""}
											onChange={(_, newValue) =>
												field.onChange(newValue ? newValue.mod_id : "")
											}
											renderInput={(params) => (
												<CustomTextField
													{...params}
													error={!!errors.mod_id}
													helperText={errors.mod_id && "Campo requerido"}
												/>
											)}
										/>
									)}
								/>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Menú Padre</CustomFormLabel>
							<FormControl fullWidth error={!!errors.menu_parent_id}>
								<Controller
									name="menu_parent_id"
									control={control}
									render={({ field: { onChange, value, ...restField } }) => {
										const selectedMenu =
											menus.find((m) => m.menu_id === value) || null;

										return (
											<Autocomplete
												options={menus}
												getOptionLabel={(option) => option.menu_name || ""}
												isOptionEqualToValue={(option, val) =>
													option.menu_id === val?.menu_id
												}
												value={selectedMenu}
												onChange={(_, newValue) =>
													onChange(newValue ? newValue.menu_id : null)
												}
												renderInput={(params) => (
													<CustomTextField
														{...params}
														error={!!errors.menu_parent_id}
														helperText={
															errors.menu_parent_id && "Campo inválido"
														}
													/>
												)}
												{...restField}
											/>
										);
									}}
								/>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Icono</CustomFormLabel>
							<FormControl fullWidth error={!!errors.menu_icon_name}>
								<Controller
									name="menu_icon_name"
									control={control}
									rules={{ required: true }}
									render={({ field }) => (
										<CustomTextField
											{...field}
											error={!!errors.menu_icon_name}
											helperText={errors.menu_icon_name && "Campo requerido"}
										/>
									)}
								/>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Href</CustomFormLabel>
							<FormControl fullWidth error={!!errors.menu_href}>
								<Controller
									name="menu_href"
									control={control}
									rules={{ required: true }}
									render={({ field }) => (
										<CustomTextField
											{...field}
											error={!!errors.menu_href}
											helperText={errors.menu_href && "Campo requerido"}
										/>
									)}
								/>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={6}>
							<CustomFormLabel>URL</CustomFormLabel>
							<FormControl fullWidth error={!!errors.menu_url}>
								<Controller
									name="menu_url"
									control={control}
									rules={{ required: true }}
									render={({ field }) => (
										<CustomTextField
											{...field}
											error={!!errors.menu_url}
											helperText={errors.menu_url && "Campo requerido"}
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

export default FormRegisterMenu;
