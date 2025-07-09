/** biome-ignore-all lint/nursery/useUniqueElementIds: <explanation> */
import React, { useMemo, useState } from "react";
import {
	Typography,
	Table,
	TableBody,
	Snackbar,
	Alert,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	IconButton,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	FormControl,
	Autocomplete,
} from "@mui/material";
import { IconUserHeart } from "@tabler/icons-react";
import { EditOutlined, DeleteOutline } from "@mui/icons-material";
import { useFetch } from "../../../../hooks/useFetch";
import PageContainer from "../../../../components/container/PageContainer";
import ParentCard from "../../../../components/shared/ParentCard";
import Breadcrumb from "../../../../layouts/full/shared/breadcrumb/Breadcrumb";
import { useAuth } from "../../../../context/AuthContext";
import {
	createPersonalMedical,
	deletePersonalMedical,
} from "../../../../services/admin/PersonalMedicalService";
import { useForm, Controller } from "react-hook-form";
import EditModalPersonalMedical from "./EditModalPersonalMedical";

const BCrumb = [{ to: "/", title: "Home" }, { title: "Personal Médico" }];

const PersonalMedical = () => {
	const { data, refetch } = useFetch(
		"http://localhost:5000/admin/Medical_staff/list",
	);
	const rows = useMemo(() => {
		const safeData = data?.data;
		return Array.isArray(safeData) ? safeData : [];
	}, [data]);

	const { user } = useAuth();
	const [openCreate, setOpenCreate] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleteId, setDeleteId] = useState(null);

	const handleOpenDelete = (id) => {
		setDeleteId(id);
		setDeleteDialogOpen(true);
	};

	const handleCloseDelete = () => {
		setDeleteId(null);
		setDeleteDialogOpen(false);
	};

	const handleDelete = async (med_id) => {
		if (!med_id) return; 

		const userDeleted = user.user.user_login_id;
		const res = await deletePersonalMedical(med_id, userDeleted);

		if (res.result) {
			setSnackbarSeverity("success");
			setSnackbarMessage("Personal médico eliminado correctamente.");
			refetch();
			setDeleteDialogOpen(false); 
		} else {
			setSnackbarSeverity("error");
			setSnackbarMessage(res.message || "Error al eliminar personal médico.");
		}
		setSnackbarOpen(true);
	};

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			med_person_id: "",
			med_type_id: "",
			med_registration_number: "",
			med_specialty: "",
		},
	});

	const { data: personsResponse } = useFetch(
		"http://localhost:5000/admin/persons/list",
	);
	const personsData = Array.isArray(personsResponse?.data)
		? personsResponse.data
		: [];

	const { data: medicalTypesResponse } = useFetch(
		"http://localhost:5000/admin/medicalPersonType/list",
	);
	const medicalTypes = Array.isArray(medicalTypesResponse?.data)
		? medicalTypesResponse.data
		: [];

	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState("success");
	const [openEdit, setOpenEdit] = useState(false);
	const [selectedPersonal, setSelectedPersonal] = useState(null);

	const handleOpenEdit = (row) => {
		setSelectedPersonal(row);
		setOpenEdit(true);
	};

	const handleCloseEdit = () => {
		setOpenEdit(false);
		setSelectedPersonal(null);
	};

	const handleSnackbarClose = () => setSnackbarOpen(false);

	const handleOpenCreate = () => {
		reset();
		setOpenCreate(true);
	};

	const handleCloseCreate = () => {
		reset();
		setOpenCreate(false);
	};

	const onSubmitCreate = async (formData) => {
		try {
			const payload = {
				...formData,
				med_state: true,
				user_created: user.user.user_login_id,
			};
			if (!payload.med_registration_number?.trim()) {
				delete payload.med_registration_number;
			}

			const res = await createPersonalMedical(payload);

			if (res.result) {
				setSnackbarSeverity("success");
				setSnackbarMessage("Personal médico creado correctamente.");
				handleCloseCreate();
				refetch();
			} else {
				setSnackbarSeverity("error");
				setSnackbarMessage(res.message || "Error al crear.");
			}
		} catch (error) {
			setSnackbarSeverity("error");
			setSnackbarMessage("Error inesperado al crear.");
		}
		setSnackbarOpen(true);
	};

	if (!data) {
		return <Typography>Cargando personal médico...</Typography>;
	}

	return (
		<PageContainer
			title="Personal Médico"
			description="Listado de personal médico"
		>
			<Breadcrumb title="Personal Médico" items={BCrumb} />

			<Button
				variant="contained"
				color="primary"
				startIcon={<IconUserHeart size={20} />}
				onClick={handleOpenCreate}
				sx={{ mb: 2, textTransform: "none", fontWeight: 600 }}
			>
				Crear Personal Médico
			</Button>

			<ParentCard title="Lista de Personal Médico">
				<Paper variant="outlined">
					<TableContainer>
						<Snackbar
							open={snackbarOpen}
							autoHideDuration={3000}
							onClose={handleSnackbarClose}
							anchorOrigin={{ vertical: "top", horizontal: "right" }}
						>
							<Alert
								onClose={handleSnackbarClose}
								severity={snackbarSeverity}
								sx={{ width: "100%" }}
							>
								{snackbarMessage}
							</Alert>
						</Snackbar>

						<Table>
							<TableHead>
								<TableRow>
									<TableCell>Nombres</TableCell>
									<TableCell>Apellidos</TableCell>
									<TableCell>Especialidad</TableCell>
									<TableCell>N° Registro</TableCell>
									<TableCell>Tipo ID</TableCell>
									<TableCell>Creado por</TableCell>
									<TableCell>Fecha creación</TableCell>
									<TableCell>Acciones</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{rows.map((row) => (
									<TableRow key={row.med_id} hover>
										<TableCell>{row.person_names || "-"}</TableCell>
										<TableCell>{row.person_surnames || "-"}</TableCell>
										<TableCell>{row.med_specialty}</TableCell>
										<TableCell>{row.med_registration_number}</TableCell>
										<TableCell>{row.med_type_name}</TableCell>
										<TableCell>{row.user_created}</TableCell>
										<TableCell>{row.date_created}</TableCell>
										<TableCell align="center">
											<IconButton onClick={() => handleOpenEdit(row)}>
												<EditOutlined fontSize="small" />
											</IconButton>
											<IconButton onClick={() => handleOpenDelete(row.med_id)}>
												<DeleteOutline fontSize="small" />
											</IconButton>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</Paper>
			</ParentCard>

			{/* Diálogo Confirmar Eliminación */}
			<Dialog open={deleteDialogOpen} onClose={handleCloseDelete}>
				<DialogTitle>Confirmar Eliminación</DialogTitle>
				<DialogContent>
					<Typography>
						¿Está seguro que desea eliminar este personal médico?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDelete}>Cancelar</Button>
					<Button
						onClick={() => handleDelete(deleteId)}
						color="error"
						variant="contained"
					>
						Eliminar
					</Button>
				</DialogActions>
			</Dialog>

			{/* Modal Crear Personal Médico */}
			<Dialog
				open={openCreate}
				onClose={handleCloseCreate}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Crear Personal Médico</DialogTitle>
				<DialogContent>
					<form
						id="create-medical-form"
						onSubmit={handleSubmit(onSubmitCreate)}
					>
						{/* Persona */}
						<FormControl
							fullWidth
							sx={{ mt: 2 }}
							error={!!errors.med_person_id}
						>
							<Controller
								name="med_person_id"
								control={control}
								rules={{ required: "Seleccione una persona" }}
								render={({ field }) => (
									<Autocomplete
										options={personsData}
										getOptionLabel={(option) =>
											option.per_names && option.per_surnames
												? `${option.per_names} ${option.per_surnames}`
												: ""
										}
										isOptionEqualToValue={(option, value) =>
											option.per_id === value
										}
										value={
											personsData.find((p) => p.per_id === field.value) || null
										}
										onChange={(_, newValue) =>
											field.onChange(newValue ? newValue.per_id : "")
										}
										renderOption={(props, option) => (
											<li {...props} key={option.per_id}>
												{option.per_names} {option.per_surnames}
											</li>
										)}
										renderInput={(params) => (
											<TextField
												{...params}
												label="Persona"
												variant="outlined"
												error={!!errors.med_person_id}
												helperText={errors.med_person_id?.message}
											/>
										)}
									/>
								)}
							/>
						</FormControl>

						{/* Tipo ID */}
						<FormControl fullWidth sx={{ mt: 2 }} error={!!errors.med_type_id}>
							<Controller
								name="med_type_id"
								control={control}
								rules={{ required: "Tipo de personal médico requerido" }}
								render={({ field }) => (
									<Autocomplete
										options={medicalTypes}
										getOptionLabel={(option) => option.mpt_name || ""}
										isOptionEqualToValue={(option, value) =>
											option.mpt_id === value
										}
										value={
											medicalTypes.find((t) => t.mpt_id === field.value) || null
										}
										onChange={(_, newValue) =>
											field.onChange(newValue ? newValue.mpt_id : "")
										}
										renderInput={(params) => (
											<TextField
												{...params}
												label="Tipo de Personal Médico"
												variant="outlined"
												error={!!errors.med_type_id}
												helperText={errors.med_type_id?.message}
											/>
										)}
									/>
								)}
							/>
						</FormControl>

						{/* Especialidad */}
						<Controller
							name="med_specialty"
							control={control}
							rules={{ required: "Especialidad requerida" }}
							render={({ field }) => (
								<TextField
									{...field}
									label="Especialidad"
									fullWidth
									variant="outlined"
									error={!!errors.med_specialty}
									helperText={errors.med_specialty?.message}
									sx={{ mt: 2 }}
								/>
							)}
						/>
					</form>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseCreate}>Cancelar</Button>
					<Button
						type="submit"
						form="create-medical-form"
						variant="contained"
						color="primary"
					>
						Crear
					</Button>
				</DialogActions>
			</Dialog>
			<EditModalPersonalMedical
				open={openEdit}
				onClose={handleCloseEdit}
				selectedData={selectedPersonal}
				onUpdate={refetch}
				personsData={personsData}
				medicalTypes={medicalTypes}
			/>
		</PageContainer>
	);
};

export default PersonalMedical;
