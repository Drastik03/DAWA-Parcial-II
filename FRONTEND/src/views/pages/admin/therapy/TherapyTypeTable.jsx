import React, { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	IconButton,
	Tooltip,
	Snackbar,
	Alert,
	CircularProgress,
	Box,
	TextField,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Button,
	Stack,
	Typography,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import EditTherapyType from "./EditTherapyType";
import { useFetch } from "../../../../hooks/useFetch";

const TherapyTypeTable = () => {
	const [selectedTherapy, setSelectedTherapy] = useState(null);
	const [openEdit, setOpenEdit] = useState(false);
	const [alert, setAlert] = useState({
		open: false,
		message: "",
		severity: "success",
	});
	const [searchTerm, setSearchTerm] = useState("");
	const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

	const {
		data: therapyTypes,
		loading,
		error,
		refetch,
	} = useFetch("http://localhost:5000/admin/therapy-type/list");

	const handleEdit = (therapy) => {
		setSelectedTherapy(therapy);
		setOpenEdit(true);
	};

	const confirmDelete = (id) => {
		setDeleteDialog({ open: true, id });
	};

	const handleDelete = async () => {
		try {
			const res = await axios.patch(
				`http://localhost:5000/admin/therapy-type/delete/${deleteDialog.id}`,
				deleteDialog.id,
				{ headers: { tokenapp: Cookies.get("token") } },
			);

			if (res.data.result) {
				setAlert({
					open: true,
					message: "Tipo de terapia eliminado",
					severity: "success",
				});
				refetch();
			} else {
				setAlert({
					open: true,
					message: res.data.message,
					severity: "warning",
				});
			}
		} catch (error) {
			setAlert({
				open: true,
				message: "Error al eliminar tipo de terapia",
				severity: "error",
			});
		} finally {
			setDeleteDialog({ open: false, id: null });
		}
	};

	const filteredTherapies = therapyTypes?.data?.filter((therapy) =>
		therapy.tht_name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	if (loading) {
		return (
			<Box textAlign="center" mt={4}>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box textAlign="center" mt={4}>
				<Alert severity="error">Error al cargar los datos</Alert>
			</Box>
		);
	}

	return (
		<Box p={2}>
			<Typography variant="h6" gutterBottom>
				Listado de Tipos de Terapia
			</Typography>
			<Paper elevation={3} sx={{ p: 2, mb: 2, mt: 4 }}>
				<Stack direction="row" spacing={2}>
					<TextField
						label="Buscar por nombre"
						variant="outlined"
						fullWidth
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</Stack>
			</Paper>

			<TableContainer component={Paper} sx={{ overflowX: "auto" }}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Nombre</TableCell>
							<TableCell>Descripción</TableCell>
							<TableCell>Fecha de Creación</TableCell>
							<TableCell>Modificado</TableCell>
							<TableCell>Acciones</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{filteredTherapies?.map((therapy) => (
							<TableRow key={therapy.tht_id}>
								<TableCell>{therapy.tht_name}</TableCell>
								<TableCell>{therapy.tht_description}</TableCell>
								<TableCell>{therapy.date_created}</TableCell>
								<TableCell>
									{therapy.user_modified
										? `${therapy.user_modified} (${therapy.date_modified})`
										: "—"}
								</TableCell>
								<TableCell>
									<Tooltip title="Editar">
										<IconButton onClick={() => handleEdit(therapy)}>
											<Edit />
										</IconButton>
									</Tooltip>
									<Tooltip title="Eliminar">
										<IconButton onClick={() => confirmDelete(therapy.tht_id)}>
											<Delete />
										</IconButton>
									</Tooltip>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<EditTherapyType
				open={openEdit}
				onClose={() => setOpenEdit(false)}
				selectedTherapyType={selectedTherapy}
				onUpdate={refetch}
			/>

			<Snackbar
				open={alert.open}
				autoHideDuration={4000}
				onClose={() => setAlert({ ...alert, open: false })}
			>
				<Alert
					severity={alert.severity}
					onClose={() => setAlert({ ...alert, open: false })}
				>
					{alert.message}
				</Alert>
			</Snackbar>

			<Dialog
				open={deleteDialog.open}
				onClose={() => setDeleteDialog({ open: false, id: null })}
			>
				<DialogTitle>¿Eliminar tipo de terapia?</DialogTitle>
				<DialogContent>Esta acción no se puede deshacer.</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialog({ open: false, id: null })}>
						Cancelar
					</Button>
					<Button variant="contained" color="error" onClick={handleDelete}>
						Eliminar
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default TherapyTypeTable;
