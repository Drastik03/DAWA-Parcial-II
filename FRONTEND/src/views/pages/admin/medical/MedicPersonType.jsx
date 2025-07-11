// src/pages/admin/medicalType/MedicPersonType.jsx
import React, { useMemo, useState } from "react";
import {
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Snackbar,
	Alert,
	IconButton,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
} from "@mui/material";
import {
	EditOutlined,
	DeleteOutline,
	AddCircleOutline,
} from "@mui/icons-material";
import PageContainer from "../../../../components/container/PageContainer";
import ParentCard from "../../../../components/shared/ParentCard";
import Breadcrumb from "../../../../layouts/full/shared/breadcrumb/Breadcrumb";
import { useFetch } from "../../../../hooks/useFetch";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";
import EditModalMedicalType from "./EditModalMedicalType";
import { useAuth } from "../../../../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL;
const BCrumb = [
	{ to: "/", title: "Home" },
	{ title: "Tipos de Personal Médico" },
];

const MedicPersonType = () => {
	const { data, refetch } = useFetch(
		`${API_BASE}/admin/medicalPersonType/list`,
	);

	const rows = useMemo(() => {
		const list = data?.data;
		return Array.isArray(list) ? list : [];
	}, [data]);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [toDeleteId, setToDeleteId] = useState(null);
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState("success");
	const [openCreate, setOpenCreate] = useState(false);
	const [openEdit, setOpenEdit] = useState(false);
	const [selectedType, setSelectedType] = useState(null);
	const { user } = useAuth();

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({ defaultValues: { mpt_name: "", mpt_description: "" } });

	const handleSnackbarClose = () => setSnackbarOpen(false);
	const handleOpenCreate = () => setOpenCreate(true);
	const handleCloseCreate = () => {
		setOpenCreate(false);
		reset();
	};
	const handleOpenEdit = (row) => {
		setSelectedType(row);
		setOpenEdit(true);
	};
	const handleCloseEdit = () => {
		setOpenEdit(false);
		setSelectedType(null);
	};

	const handleDelete = async (mpt_id) => {
		try {
			const user_process = user.user.user_login_id;
			const res = await axios.patch(
				`${API_BASE}/admin/medicalPersonType/delete/${mpt_id}`,
				user_process,
				{
					headers: { tokenapp: Cookies.get("token") },
				},
			);

			if (res.data.result) {
				setSnackbarSeverity("success");
				setSnackbarMessage("Eliminado correctamente.");
				refetch();
			} else {
				throw new Error(res.data.message);
			}
		} catch (err) {
			setSnackbarSeverity("error");
			setSnackbarMessage(err.message || "Error al eliminar");
		}
		setSnackbarOpen(true);
	};

	const onSubmitCreate = async (formData) => {
		try {
			const payload = {
				...formData,
				user_created: "admin",
			};
			const res = await axios.post(
				`${API_BASE}/admin/medicalPersonType/insert`,
				payload,
				{
					headers: { tokenapp: Cookies.get("token") },
				},
			);
			if (res.data.result) {
				setSnackbarSeverity("success");
				setSnackbarMessage("Tipo de personal creado correctamente.");
				handleCloseCreate();
				refetch();
			} else {
				throw new Error(res.data.message);
			}
		} catch (err) {
			setSnackbarSeverity("error");
			setSnackbarMessage(err.message || "Error al crear");
		}
		setSnackbarOpen(true);
	};

	return (
		<PageContainer
			title="Tipos de Personal Médico"
			description="Listado de tipos de personal médico"
		>
			<Breadcrumb title="Tipos de Personal Médico" items={BCrumb} />

			<Button
				variant="contained"
				startIcon={<AddCircleOutline />}
				onClick={handleOpenCreate}
				sx={{ mb: 2, textTransform: "none", fontWeight: 600 }}
			>
				Crear Tipo de Personal
			</Button>

			<ParentCard title="Listado de Tipos">
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
									<TableCell>ID</TableCell>
									<TableCell>Nombre</TableCell>
									<TableCell>Descripción</TableCell>
									<TableCell>Creado por</TableCell>
									<TableCell>Fecha de creación</TableCell>
									<TableCell>Acciones</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{rows.map((row) => (
									<TableRow key={row.mpt_id} hover>
										<TableCell>{row.mpt_id}</TableCell>
										<TableCell>{row.mpt_name}</TableCell>
										<TableCell>{row.mpt_description}</TableCell>
										<TableCell>{row.user_created}</TableCell>
										<TableCell>{row.date_created}</TableCell>
										<TableCell align="center">
											<IconButton onClick={() => handleOpenEdit(row)}>
												<EditOutlined fontSize="small" />
											</IconButton>
											<IconButton
												onClick={() => {
													setToDeleteId(row.mpt_id);
													setConfirmOpen(true);
												}}
											>
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

			{/* Modal Crear */}
			<Dialog
				open={openCreate}
				onClose={handleCloseCreate}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Crear Tipo de Personal Médico</DialogTitle>
				<DialogContent>
					{/** biome-ignore lint/nursery/useUniqueElementIds: <explanation> */}
					<form id="create-form" onSubmit={handleSubmit(onSubmitCreate)}>
						<Controller
							name="mpt_name"
							control={control}
							rules={{ required: "Nombre requerido" }}
							render={({ field }) => (
								<TextField
									{...field}
									label="Nombre"
									fullWidth
									variant="outlined"
									sx={{ mt: 2 }}
									error={!!errors.mpt_name}
									helperText={errors.mpt_name?.message}
								/>
							)}
						/>
						<Controller
							name="mpt_description"
							control={control}
							rules={{ required: "Descripción requerida" }}
							render={({ field }) => (
								<TextField
									{...field}
									label="Descripción"
									fullWidth
									variant="outlined"
									sx={{ mt: 2 }}
									error={!!errors.mpt_description}
									helperText={errors.mpt_description?.message}
								/>
							)}
						/>
					</form>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseCreate}>Cancelar</Button>
					<Button type="submit" form="create-form" variant="contained">
						Crear
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
				<DialogTitle>Confirmar Eliminación</DialogTitle>
				<DialogContent>
					¿Estás seguro de que deseas eliminar este tipo de personal médico?
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
					<Button
						variant="contained"
						color="error"
						onClick={async () => {
							await handleDelete(toDeleteId);
							setConfirmOpen(false);
							setToDeleteId(null);
						}}
					>
						Eliminar
					</Button>
				</DialogActions>
			</Dialog>

			{/* Modal Editar */}
			<EditModalMedicalType
				open={openEdit}
				onClose={handleCloseEdit}
				selectedData={selectedType}
				onUpdate={refetch}
			/>
		</PageContainer>
	);
};

export default MedicPersonType;
