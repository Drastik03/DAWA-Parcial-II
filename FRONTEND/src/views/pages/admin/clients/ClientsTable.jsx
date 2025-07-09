import React, { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Box,
	CircularProgress,
	Alert,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Snackbar,
	Tooltip,
} from "@mui/material";
import { useFetch } from "../../../../hooks/useFetch";
import { DeleteOutline, EditOutlined } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "../../../../context/AuthContext";
import { Edit } from "lucide-react";
import EditClientModal from "./EditClientModal";

export const ClientsTable = () => {
	const { data, loading, error, refetch } = useFetch(
		"http://localhost:5000/admin/client/list",
	);
	const { user } = useAuth();
	const clients = data?.data || [];

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [toDeleteId, setToDeleteId] = useState(null);
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState("success");
	const [openEdit, setOpenEdit] = useState(false);
	const [clientToEdit, setClientToEdit] = useState(null);

	const handleOpenEdit = (client) => {
		setClientToEdit(client);
		setOpenEdit(true);
	};

	const handleSnackbarClose = () => setSnackbarOpen(false);

	const handleDelete = async (cli_id) => {
		try {
			const user_process = user.user.user_login_id;
			const res = await axios.delete(
				`http://localhost:5000/admin/client/delete/${cli_id}`,
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

	if (loading)
		return (
			<Box mt={4} textAlign="center">
				<CircularProgress />
			</Box>
		);

	if (error) return <Alert severity="error">Error al cargar clientes</Alert>;

	return (
		<>
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

			<TableContainer component={Paper} sx={{ mt: 4, maxHeight: 350 }}>
				<Table stickyHeader size="small">
					<TableHead>
						<TableRow>
							<TableCell>ID Cliente</TableCell>
							<TableCell>Identificación</TableCell>
							<TableCell>Nombre</TableCell>
							<TableCell>Dirección Facturación</TableCell>
							<TableCell>Correo Facturación</TableCell>
							<TableCell>Fecha Creación</TableCell>
							<TableCell>Acciones</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{clients.map((client) => (
							<TableRow key={client.cli_id} hover>
								<TableCell>{client.cli_id}</TableCell>
								<TableCell>{client.cli_identification}</TableCell>
								<TableCell>{client.cli_name}</TableCell>
								<TableCell>{client.cli_address_bill || "—"}</TableCell>
								<TableCell>{client.cli_mail_bill || "—"}</TableCell>
								<TableCell>{client.date_created}</TableCell>
								<TableCell align="center">
									<Tooltip title="Editar cliente">
										<IconButton onClick={() => handleOpenEdit(client)}>
											<DeleteOutline />
										</IconButton>
									</Tooltip>
									<Tooltip title="Eliminar cliente">
										<IconButton
											onClick={() => {
												setToDeleteId(client.cli_id);
												setConfirmOpen(true);
											}}
										>
											<DeleteOutline fontSize="small" />
										</IconButton>
									</Tooltip>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				{clientToEdit && (
					<EditClientModal
						open={openEdit}
						onClose={() => setOpenEdit(false)}
						clientData={clientToEdit}
						onUpdate={refetch}
					/>
				)}
			</TableContainer>

			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
				<DialogTitle>Confirmar eliminación</DialogTitle>
				<DialogContent>
					¿Estás seguro de que deseas eliminar este cliente?
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
		</>
	);
};
