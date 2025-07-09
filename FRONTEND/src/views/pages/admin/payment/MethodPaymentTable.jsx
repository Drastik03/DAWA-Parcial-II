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
	Stack,
	Checkbox,
	FormControlLabel,
	TextField,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";

import { DeleteOutline, Edit } from "@mui/icons-material";
import PageContainer from "../../../../components/container/PageContainer";
import ParentCard from "../../../../components/shared/ParentCard";
import Breadcrumb from "../../../../layouts/full/shared/breadcrumb/Breadcrumb";
import { useAuth } from "../../../../context/AuthContext";
import { useFetch } from "../../../../hooks/useFetch";
import axios from "axios";
import Cookies from "js-cookie";

import EditPayment from "./EditPayment";
import { createPaymentMethod } from "../../../../services/admin/paymentTypeService";

const BCrumb = [{ to: "/", title: "Home" }, { title: "Tipos de Pago" }];

const PaymentMethodTable = () => {
	const { user } = useAuth();
	const { data, refetch } = useFetch(
		"http://localhost:5000/admin/payment_method/list",
	);

	const rows = useMemo(() => {
		const safeData = data?.data?.data;
		return Array.isArray(safeData) ? safeData : [];
	}, [data]);

	// Estados para modales y snackbars
	const [createOpen, setCreateOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [selectedPaymentType, setSelectedPaymentType] = useState(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleteId, setDeleteId] = useState(null);

	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState("success");

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			pme_name: "",
			pme_description: "",
			pme_require_references: false,
			pme_require_picture_proff: false,
		},
	});

	const handleOpenDelete = (id) => {
		setDeleteId(id);
		setDeleteDialogOpen(true);
	};

	const handleCloseDelete = () => {
		setDeleteId(null);
		setDeleteDialogOpen(false);
	};

	const handleDelete = async () => {
		try {
			const response = await axios.delete(
				`http://localhost:5000/admin/payment_method/delete/${deleteId}`,
				{
					headers: {
						tokenapp: Cookies.get("token"),
					},
				},
			);

			if (response.data.result) {
				setSnackbarSeverity("success");
				setSnackbarMessage("Tipo de pago eliminado correctamente.");
				refetch();
			} else {
				setSnackbarSeverity("error");
				setSnackbarMessage(response.data.message || "Error al eliminar.");
			}
		} catch (error) {
			setSnackbarSeverity("error");
			setSnackbarMessage("Error inesperado al eliminar.");
		} finally {
			setSnackbarOpen(true);
			handleCloseDelete();
		}
	};

	const handleOpenEdit = (paymentType) => {
		setSelectedPaymentType(paymentType);
		setEditOpen(true);
	};

	const handleCloseEdit = () => {
		setSelectedPaymentType(null);
		setEditOpen(false);
	};

	const handleOpenCreate = () => {
		reset();
		setCreateOpen(true);
	};

	const handleCloseCreate = () => {
		reset();
		setCreateOpen(false);
	};

	const onSubmitCreate = async (dataForm) => {
		try {
			const payload = {
				...dataForm,
				user_created: user.user.user_login_id,
			};

			const res = await createPaymentMethod(payload);

			if (res.result) {
				setSnackbarSeverity("success");
				setSnackbarMessage("Tipo de pago creado correctamente.");
				refetch();
				handleCloseCreate();
			} else {
				setSnackbarSeverity("error");
				setSnackbarMessage(res.message || "Error al crear tipo de pago.");
			}
		} catch (error) {
			setSnackbarSeverity("error");
			setSnackbarMessage("Error inesperado al crear tipo de pago.");
		}
		setSnackbarOpen(true);
	};

	return (
		<PageContainer
			title="Tipos de Pago"
			description="Listado de tipos de método de pago"
		>
			<Breadcrumb title="Tipos de Pago" items={BCrumb} />

			<ParentCard
				title={
					<Stack
						direction="row"
						justifyContent="space-between"
						alignItems="center"
						spacing={2}
					>
						<Typography variant="h5">Lista de Tipos de Pago</Typography>
						<Stack direction="row" spacing={1}>
							<Button
								variant="contained"
								color="primary"
								onClick={handleOpenCreate}
							>
								Crear
							</Button>
						</Stack>
					</Stack>
				}
			>
				<Paper variant="outlined">
					<TableContainer>
						<Snackbar
							open={snackbarOpen}
							autoHideDuration={3000}
							onClose={() => setSnackbarOpen(false)}
							anchorOrigin={{ vertical: "top", horizontal: "right" }}
						>
							<Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
						</Snackbar>

						<Table>
							<TableHead>
								<TableRow>
									<TableCell>ID</TableCell>
									<TableCell>Nombre</TableCell>
									<TableCell>Descripción</TableCell>
									<TableCell>Requiere referencias</TableCell>
									<TableCell>Requiere comprobante</TableCell>
									<TableCell>Creado por</TableCell>
									<TableCell>Fecha creación</TableCell>
									<TableCell align="center">Acciones</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{rows.map((row) => (
									<TableRow key={row.pme_id} hover>
										<TableCell>{row.pme_id}</TableCell>
										<TableCell>{row.pme_name}</TableCell>
										<TableCell>{row.pme_description}</TableCell>
										<TableCell>
											{row.pme_require_references ? "Sí" : "No"}
										</TableCell>
										<TableCell>
											{row.pme_require_picture_proff ? "Sí" : "No"}
										</TableCell>
										<TableCell>{row.user_created}</TableCell>
										<TableCell>{row.date_created}</TableCell>
										<TableCell align="center">
											<IconButton onClick={() => handleOpenEdit(row)}>
												<Edit fontSize="small" />
											</IconButton>
											<IconButton onClick={() => handleOpenDelete(row.pme_id)}>
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
				open={createOpen}
				onClose={handleCloseCreate}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Crear Tipo de Pago</DialogTitle>
				<DialogContent>
					<form
						id="create-payment-form"
						onSubmit={handleSubmit(onSubmitCreate)}
					>
						<Stack spacing={2} sx={{ mt: 1 }}>
							<Controller
								name="pme_name"
								control={control}
								rules={{ required: "Nombre es obligatorio" }}
								render={({ field }) => (
									<TextField
										{...field}
										label="Nombre"
										error={!!errors.pme_name}
										helperText={errors.pme_name?.message}
										fullWidth
									/>
								)}
							/>

							<Controller
								name="pme_description"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Descripción"
										multiline
										rows={3}
										fullWidth
									/>
								)}
							/>

							<Controller
								name="pme_require_references"
								control={control}
								render={({ field }) => (
									<FormControlLabel
										control={
											<Checkbox
												checked={field.value}
												onChange={(e) => field.onChange(e.target.checked)}
											/>
										}
										label="Requiere referencias"
									/>
								)}
							/>

							<Controller
								name="pme_require_picture_proff"
								control={control}
								render={({ field }) => (
									<FormControlLabel
										control={
											<Checkbox
												checked={field.value}
												onChange={(e) => field.onChange(e.target.checked)}
											/>
										}
										label="Requiere comprobante"
									/>
								)}
							/>
						</Stack>
					</form>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseCreate}>Cancelar</Button>
					<Button
						type="submit"
						form="create-payment-form"
						variant="contained"
						color="primary"
					>
						Crear
					</Button>
				</DialogActions>
			</Dialog>

			{/* Modal Editar */}
			<EditPayment
				open={editOpen}
				onClose={handleCloseEdit}
				selectedPaymentType={selectedPaymentType}
				onUpdate={refetch}
			/>

			{/* Modal Eliminar */}
			<Dialog open={deleteDialogOpen} onClose={handleCloseDelete}>
				<DialogTitle>Confirmar Eliminación</DialogTitle>
				<DialogContent>
					<Typography>¿Deseas eliminar este tipo de pago?</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDelete}>Cancelar</Button>
					<Button onClick={handleDelete} color="error" variant="contained">
						Eliminar
					</Button>
				</DialogActions>
			</Dialog>
		</PageContainer>
	);
};

export default PaymentMethodTable;
