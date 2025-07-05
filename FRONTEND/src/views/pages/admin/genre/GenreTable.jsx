/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */
import { useMemo, useState } from "react";
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
import { useAuth } from "../../../../context/AuthContext";
import {
	editGenre,
	deleteGenre,
	createGenre,
} from "../../../../services/genreService";

const BCrumb = [{ to: "/", title: "Home" }, { title: "Géneros" }];

const GenreTableList = () => {
	const { data, refetch } = useFetch(
		"http://localhost:5000/admin/Person_genre/list",
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
	const [openCreate, setOpenCreate] = useState(false);
	const [createValue, setCreateValue] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState("success");
	const handleOpenCreate = () => {
		setCreateValue("");
		setOpenCreate(true);
	};
	const handleCreateSubmit = async () => {
		if (!createValue.trim()) {
			setSnackbarSeverity("error");
			setSnackbarMessage("El nombre del género es obligatorio.");
			setSnackbarOpen(true);
			return;
		}

		const payload = {
			genre_name: createValue.trim(),
			user_process: user.user.user_login_id,
		};

		try {
			const res = await createGenre(payload);
			if (res.result) {
				setSnackbarSeverity("success");
				setSnackbarMessage("Género creado correctamente.");
				refetch();
				handleCloseCreate();
			} else {
				setSnackbarSeverity("error");
				setSnackbarMessage(res.message || "No se pudo crear el género.");
			}
		} catch (error) {
			setSnackbarSeverity("error");
			setSnackbarMessage("Error inesperado al crear el género.");
		}

		setSnackbarOpen(true);
	};

	const handleCloseCreate = () => {
		setOpenCreate(false);
	};

	const handleOpenEdit = (row) => {
		setSelectedRow(row);
		setEditValue(row.genre_name);
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
			genre_name: editValue,
			user_process: user.user.user_login_id,
		};

		try {
			const res = await editGenre(payload);

			if (res.result) {
				setSnackbarSeverity("success");
				setSnackbarMessage("Género actualizado correctamente.");
				refetch();
			} else {
				setSnackbarSeverity("error");
				setSnackbarMessage(res.message || "No se pudo actualizar el género.");
			}
		} catch (error) {
			setSnackbarSeverity("error");
			setSnackbarMessage("Error inesperado al actualizar el género.");
		}

		setSnackbarOpen(true);
		handleClose();
	};

	const handleDeleteConfirm = async () => {
		try {
			const res = await deleteGenre(selectedRow.id, user.user.user_id);
			if (res.result) {
				setSnackbarSeverity("success");
				setSnackbarMessage("Género eliminado correctamente.");
				refetch();
			} else {
				setSnackbarSeverity("error");
				setSnackbarMessage("Error al eliminar el género.");
			}
		} catch (error) {
			setSnackbarSeverity("error");
			setSnackbarMessage("Ocurrió un error inesperado.");
		}
		setSnackbarOpen(true);
		handleClose();
	};

	return (
		<PageContainer title="Géneros" description="Listado de géneros de persona">
			<Breadcrumb title="Géneros" items={BCrumb} />

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
				onClick={handleOpenCreate}
				sx={{ mb: 2, textTransform: "none", fontWeight: 600 }}
			>
				Crear Género
			</Button>

			<ParentCard title="Lista de Géneros">
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
						<Table aria-label="genre table">
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
											<Typography fontWeight={600}>{row.genre_name}</Typography>
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
			<Dialog
				open={openCreate}
				onClose={handleCloseCreate}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Crear Género</DialogTitle>
				<DialogContent sx={{ pt: 1 }}>
					<Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
						Ingresa el nombre del nuevo género:
					</Typography>
					<TextField
						label="Nombre del género"
						fullWidth
						variant="outlined"
						value={createValue}
						onChange={(e) => setCreateValue(e.target.value)}
						sx={{ mt: 1 }}
					/>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={handleCloseCreate} color="inherit">
						Cancelar
					</Button>
					<Button
						onClick={handleCreateSubmit}
						variant="contained"
						color="primary"
					>
						Crear
					</Button>
				</DialogActions>
			</Dialog>

			{/* Modal Editar */}
			<Dialog open={openEdit} onClose={handleClose} fullWidth maxWidth="sm">
				<DialogTitle>Editar Género</DialogTitle>
				<DialogContent sx={{ pt: 1 }}>
					<Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
						Puedes modificar el nombre del género seleccionado:
					</Typography>
					<TextField
						label="Nombre del género"
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
				<DialogTitle>Eliminar Género</DialogTitle>
				<DialogContent>
					<Typography>
						¿Estás seguro de que deseas eliminar "{selectedRow?.genre_name}"?
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

export default GenreTableList;
