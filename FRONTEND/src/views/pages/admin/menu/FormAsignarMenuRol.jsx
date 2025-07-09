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
import { insertMenuRol } from "../../../../services/admin/MenuRolService";

const BCrumb = [{ to: "/", title: "Home" }, { title: "Asignar Menú a Rol" }];

const FormAsignarMenuRol = () => {
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
	const { data: menusData } = useFetch("http://localhost:5000/Menu/list");

	const roles = Array.isArray(rolesData) ? rolesData : [];
	const menus = Array.isArray(menusData) ? menusData : [];

	const onSubmit = async (data) => {
		try {
			const payload = {
				rol_id: data.rol_id,
				menu_id: data.menu_id,
			};
			const res = await insertMenuRol(payload);
			if (res.result) {
				setSnackbarMessage("Menú asignado al rol exitosamente");
				setSnackbarSeverity("success");
				setOpenSnackbar(true);
				reset();
			} else {
				throw new Error(res.message || "Error al asignar menú al rol");
			}
		} catch (error) {
			setSnackbarMessage(`Error: ${error.message}`);
			setSnackbarSeverity("error");
			setOpenSnackbar(true);
		}
	};

	return (
		<PageContainer
			title="Asignar Menú a Rol"
			description="Formulario para asignar un menú a un rol"
		>
			<Breadcrumb title="Menús Roles" items={BCrumb} />
			<ParentCard
				title="Asignar Menú a Rol"
				footer={
					<>
						<Button variant="contained" color="error" onClick={() => reset()}>
							Cancelar
						</Button>
						<Button
							type="submit"
							variant="contained"
							color="primary"
							form="asignar-menu-rol-form"
						>
							Asignar
						</Button>
					</>
				}
			>
				<Box
					component="form"
					id="asignar-menu-rol-form"
					onSubmit={handleSubmit(onSubmit)}
					noValidate
				>
					<Grid container spacing={3} mb={3}>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Rol</CustomFormLabel>
							<FormControl fullWidth error={!!errors.rol_id}>
								<Controller
									name="rol_id"
									control={control}
									rules={{ required: true }}
									render={({ field }) => (
										<Autocomplete
											options={roles}
											getOptionLabel={(option) => option?.rol_name || ""}
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
							<CustomFormLabel>Menú</CustomFormLabel>
							<FormControl fullWidth error={!!errors.menu_id}>
								<Controller
									name="menu_id"
									control={control}
									rules={{ required: true }}
									render={({ field }) => (
										<Autocomplete
											options={menus}
											getOptionLabel={(option) => option.menu_name || ""}
											onChange={(_, newValue) =>
												field.onChange(newValue ? newValue.menu_id : "")
											}
											renderInput={(params) => (
												<CustomTextField
													{...params}
													error={!!errors.menu_id}
													helperText={errors.menu_id && "Campo requerido"}
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

export default FormAsignarMenuRol;
