/** biome-ignore-all lint/nursery/useUniqueElementIds: <explanation> */
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
import { createRole } from "../../../../services/admin/roleService";
import { useFetch } from "../../../../hooks/useFetch";
import { asignarRole } from "../../../../services/admin/UserRoleService";

const BCrumb = [{ to: "/", title: "Home" }, { title: "Asignar Rol" }];

const FormAsignarRol = () => {
	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm();

	const [openSnackbar, setOpenSnackbar] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState("success");

	const { data: rolesData } = useFetch("http://localhost:5000/RolSistem/list");
	const { data: usersData } = useFetch("http://localhost:5000/user/list");

	const roles = Array.isArray(rolesData) ? rolesData : [];
	const users = Array.isArray(usersData) ? usersData : [];

	const onSubmit = async (data) => {
		try {
			const res = await asignarRole(data);
			if (res.result) {
				setSnackbarMessage("Rol asignado exitosamente");
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
			title="Asignación de Rol"
			description="Formulario para asignar rol a usuario"
		>
			<Breadcrumb title="Roles" items={BCrumb} />
			<ParentCard
				title="Asignar Rol"
				footer={
					<>
						<Button variant="contained" color="error" onClick={() => reset()}>
							Cancelar
						</Button>
						<Button
							type="submit"
							variant="contained"
							color="primary"
							form="asignar-rol-form"
						>
							Asignar
						</Button>
					</>
				}
			>
				<Box
					component="form"
					id="asignar-rol-form"
					onSubmit={handleSubmit(onSubmit)}
					noValidate
				>
					<Grid container spacing={3} mb={3}>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Rol</CustomFormLabel>
							<FormControl fullWidth error={!!errors.id_rol}>
								<Controller
									name="id_rol"
									control={control}
									rules={{ required: true }}
									render={({ field }) => (
										<Autocomplete
											options={roles}
											getOptionLabel={(option) => `${option?.rol_name}`}
											onChange={(_, newValue) =>
												field.onChange(newValue ? newValue.rol_id : "")
											}
											renderInput={(params) => (
												<CustomTextField
													{...params}
													error={!!errors.rol_id}
													helperText={errors.rol_id && "Campo requerido"}
												/>
											)}
										/>
									)}
								/>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Usuario</CustomFormLabel>
							<FormControl fullWidth error={!!errors.id_user}>
								<Controller
									name="id_user"
									control={control}
									rules={{ required: true }}
									render={({ field }) => (
										<Autocomplete
											options={users}
											getOptionLabel={(option) => option.full_name ?? ""}
											isOptionEqualToValue={(option, value) =>
												option.user_id === value
											}
											value={
												users.find((u) => u.user_id === field.value) || null
											}
											onChange={(_, newValue) =>
												field.onChange(newValue ? newValue.user_id : "")
											}
											renderOption={(props, option) => (
												<li {...props}>
													{option.full_name} ({option.user_login_id})
												</li>
											)}
											renderInput={(params) => (
												<CustomTextField
													{...params}
													error={!!errors.id_user}
													helperText={errors.id_user && "Campo requerido"}
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

export default FormAsignarRol;
