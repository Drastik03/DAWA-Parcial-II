/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */
import { useMemo, useState } from "react";
import PropTypes from "prop-types";
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
} from "@mui/material";
import { EditOutlined, DeleteOutline } from "@mui/icons-material";

import { useFetch } from "../../../../hooks/useFetch";
import PageContainer from "../../../../components/container/PageContainer";
import ParentCard from "../../../../components/shared/ParentCard";
import Breadcrumb from "../../../../layouts/full/shared/breadcrumb/Breadcrumb";
import {
	deleteMarital,
	updateMarital,
} from "../../../../services/admin/MaritalService";
import { useAuth } from "../../../../context/AuthContext";

const BCrumb = [{ to: "/", title: "Home" }, { title: "Estados Civiles" }];

const MaritalTableList = () => {
	const { data, refetch } = useFetch(
		"http://localhost:5000/admin/Marital_status/list",
	);
	const rows = useMemo(
		() => (Array.isArray(data?.data) ? data?.data : []),
		[data],
	);

	const { user } = useAuth();

	const [openEdit, setOpenEdit] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);
	const [selectedRow, setSelectedRow] = useState(null);
	const [editValue, setEditValue] = useState("");
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState("success");

	const handleOpenEdit = (row) => {
		setSelectedRow(row);
		setEditValue(row.status_name);
		setOpenEdit(true);
	};

	const handleOpenDelete = (row) => {
		setSelectedRow(row);
		setOpenDelete(true);
	};

	const handleClose = () => {
		setOpenEdit(false);
		setOpenDelete(false);
		setSelectedRow(null);
	};

	const handleEditSubmit = async () => {
		const payload = {
			id: selectedRow.id,
			status_name: editValue,
			user_process: user.user.user_login_id,
		};

		try {
			const res = await updateMarital(payload);

			if (res.result) {
				setSnackbarSeverity("success");
				setSnackbarMessage("Estado civil actualizado correctamente.");
				refetch();
			} else {
				setSnackbarSeverity("error");
				setSnackbarMessage(
					res.message || "No se pudo actualizar el estado civil.",
				);
			}
		} catch (error) {
			console.error(error);
			setSnackbarSeverity("error");
			setSnackbarMessage("Error inesperado al actualizar el estado civil.");
		}

		setSnackbarOpen(true);
		handleClose();
	};

	const handleDeleteConfirm = async () => {
		try {
			console.log(user.user.user_id);

			const res = await deleteMarital(selectedRow.id, user.user.user_id);
			if (res.result) {
				setSnackbarSeverity("success");
				setSnackbarMessage("Estado civil eliminado correctamente.");
				refetch();
			} else {
				setSnackbarSeverity("error");
				setSnackbarMessage("Error al eliminar el estado civil.");
			}
		} catch (error) {
			console.log(error);
			setSnackbarSeverity("error");
			setSnackbarMessage("Ocurrió un error inesperado.");
		}
		setSnackbarOpen(true);
		handleClose();
	};

	return (
		<PageContainer
			title="Estados Civiles"
			description="Listado de estados civiles"
		>
			<Breadcrumb title="Estados Civiles" items={BCrumb} />

			<Button
				variant="contained"
				color="primary"
				startIcon={
					<svg
						xmlns="http://www.w3.org/2000/svg"
						height="24"
						width="24"
						viewBox="0 0 24 24"
						fill="none"
					>
						<path
							d="M12 5v14M5 12h14"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
						/>
					</svg>
				}
				onClick={() => console.log("CREAR")}
				sx={{ mb: 2, textTransform: "none", fontWeight: 600 }}
			>
				Crear Estado Civil
			</Button>

			<ParentCard title="Lista de Estados Civiles">
				<Paper variant="outlined">
					<TableContainer>
						<Snackbar
							open={snackbarOpen}
							autoHideDuration={3000}
							onClose={() => setSnackbarOpen(false)}
							anchorOrigin={{ vertical: "top", horizontal: "right" }}
						>
							<Alert
								onClose={() => setSnackbarOpen(false)}
								severity={snackbarSeverity}
								sx={{ width: "100%" }}
							>
								{snackbarMessage}
							</Alert>
						</Snackbar>
						<Table aria-label="marital table">
							<TableHead>
								<TableRow>
									<TableCell>
										<Typography variant="h6">Nombre</Typography>
									</TableCell>
									<TableCell>
										<Typography variant="h6">Estado</Typography>
									</TableCell>
									<TableCell>
										<Typography variant="h6">Creado por</Typography>
									</TableCell>
									<TableCell>
										<Typography variant="h6">Fecha creación</Typography>
									</TableCell>
									<TableCell align="center">
										<Typography variant="h6">Acciones</Typography>
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{rows.map((row) => (
									<TableRow key={row.id} hover>
										<TableCell>
											<Typography fontWeight={600}>
												{row.status_name}
											</Typography>
										</TableCell>
										<TableCell>
											<Typography color="textSecondary">
												{row.state ? "Activo" : "Inactivo"}
											</Typography>
										</TableCell>
										<TableCell>
											<Typography color="textSecondary">
												{row.user_created}
											</Typography>
										</TableCell>
										<TableCell>
											<Typography color="textSecondary">
												{row.date_created}
											</Typography>
										</TableCell>
										<TableCell align="center">
											<IconButton
												color="primary"
												onClick={() => handleOpenEdit(row)}
											>
												<EditOutlined />
											</IconButton>
											<IconButton
												color="error"
												onClick={() => handleOpenDelete(row)}
											>
												<DeleteOutline />
											</IconButton>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</Paper>
			</ParentCard>

			{/* Modal Editar */}
			<Dialog open={openEdit} onClose={handleClose} fullWidth maxWidth="sm">
				<DialogTitle>Editar Estado Civil</DialogTitle>
				<DialogContent sx={{ pt: 1 }}>
					<Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
						Puedes modificar el nombre del estado civil seleccionado:
					</Typography>
					<TextField
						label="Nombre del estado civil"
						fullWidth
						variant="outlined"
						value={editValue}
						onChange={(e) => setEditValue(e.target.value)}
						sx={{ mt: 1 }}
					/>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={handleClose} color="inherit">
						Cancelar
					</Button>
					<Button
						onClick={handleEditSubmit}
						variant="contained"
						color="primary"
					>
						Guardar
					</Button>
				</DialogActions>
			</Dialog>

			{/* Modal Eliminar */}
			<Dialog open={openDelete} onClose={handleClose}>
				<DialogTitle>Eliminar Estado Civil</DialogTitle>
				<DialogContent>
					<Typography>
						¿Estás seguro de que deseas eliminar "{selectedRow?.status_name}"?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Cancelar</Button>
					<Button
						onClick={handleDeleteConfirm}
						variant="contained"
						color="error"
					>
						Eliminar
					</Button>
				</DialogActions>
			</Dialog>
		</PageContainer>
	);
};

export default MaritalTableList;
