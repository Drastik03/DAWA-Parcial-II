import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
	Typography,
	Table,
	TableBody,
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
	DialogContentText,
	DialogActions,
	TextField,
	Alert,
	Box,
} from "@mui/material";
import { EditOutlined, DeleteOutline } from "@mui/icons-material";

import { useFetch } from "../../../../hooks/useFetch";
import PageContainer from "../../../../components/container/PageContainer";
import ParentCard from "../../../../components/shared/ParentCard";
import Breadcrumb from "../../../../layouts/full/shared/breadcrumb/Breadcrumb";
import { useNavigate } from "react-router";
import { deleteModule } from "../../../../services/admin/moduleService";

function Row({ row, onDelete, onEdit }) {
	return (
		<TableRow hover>
			<TableCell>
				<Typography variant="h6" fontWeight="600">
					{row.mod_name}
				</Typography>
			</TableCell>
			<TableCell>
				<Typography color="textSecondary">{row.mod_description}</Typography>
			</TableCell>
			<TableCell>
				<Typography color="textSecondary">{row.mod_order}</Typography>
			</TableCell>
			<TableCell>
				<Typography color="textSecondary">{row.mod_icon_name}</Typography>
			</TableCell>
			<TableCell>
				<Typography color="textSecondary">{row.mod_text_name}</Typography>
			</TableCell>
			<TableCell align="center">
				<IconButton color="primary" onClick={() => onEdit(row)}>
					<EditOutlined />
				</IconButton>
				<IconButton color="error" onClick={() => onDelete(row)}>
					<DeleteOutline />
				</IconButton>
			</TableCell>
		</TableRow>
	);
}

Row.propTypes = {
	row: PropTypes.object.isRequired,
	onDelete: PropTypes.func.isRequired,
	onEdit: PropTypes.func.isRequired,
};

const BCrumb = [{ to: "/", title: "Home" }, { title: "Módulos" }];

const ModuleTableList = () => {
	const { data, refetch } = useFetch(
		`${import.meta.env.VITE_API_URL}/Module/list`,
	);
	const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);
	const navigate = useNavigate();

	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [openEditModal, setOpenEditModal] = useState(false);
	const [selectedRow, setSelectedRow] = useState(null);
	const [editData, setEditData] = useState({});
	const [alert, setAlert] = useState({
		open: false,
		message: "",
		severity: "success",
	});

	const handleDeleteClick = (row) => {
		setSelectedRow(row);
		setOpenDeleteModal(true);
	};

	const handleEditClick = (row) => {
		setEditData(row);
		setOpenEditModal(true);
	};

	const handleCloseDeleteModal = () => {
		setOpenDeleteModal(false);
		setSelectedRow(null);
	};

	const handleCloseEditModal = () => {
		setOpenEditModal(false);
		setEditData({});
	};

	const handleConfirmDelete = async () => {
		try {
			const res = await deleteModule(selectedRow.mod_id);
			if (res.result) {
				setAlert({
					open: true,
					message: "Módulo eliminado",
					severity: "success",
				});
				refetch();
			} else {
				throw new Error();
			}
		} catch {
			setAlert({
				open: true,
				message: "Error al eliminar módulo",
				severity: "error",
			});
		} finally {
			handleCloseDeleteModal();
		}
	};

	const handleEditChange = (e) => {
		const { name, value } = e.target;
		setEditData((prev) => ({ ...prev, [name]: value }));
	};

	const handleEditSave = async () => {
		try {
			const res = await updateModule(editData);
			if (res.result) {
				setAlert({
					open: true,
					message: "Módulo actualizado",
					severity: "success",
				});
				refetch();
				handleCloseEditModal();
			} else {
				throw new Error();
			}
		} catch {
			setAlert({
				open: true,
				message: "Error al actualizar módulo",
				severity: "error",
			});
		}
	};

	return (
		<PageContainer title="Módulos" description="Listado de módulos">
			<Breadcrumb title="Módulos" items={BCrumb} />
			<Button
				variant="contained"
				color="primary"
				startIcon={
					// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
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
				onClick={() => navigate("/security/Module/Register")}
				sx={{ mb: 2, textTransform: "none", fontWeight: 600 }}
			>
				Crear Módulo
			</Button>

			{alert.open && (
				<Box mb={2}>
					<Alert
						severity={alert.severity}
						onClose={() => setAlert({ ...alert, open: false })}
						variant="filled"
					>
						{alert.message}
					</Alert>
				</Box>
			)}

			<ParentCard title="Lista de Módulos">
				<Paper variant="outlined">
					<TableContainer>
						<Table aria-label="module table">
							<TableHead>
								<TableRow>
									<TableCell>
										<Typography variant="h6">Nombre</Typography>
									</TableCell>
									<TableCell>
										<Typography variant="h6">Descripción</Typography>
									</TableCell>
									<TableCell>
										<Typography variant="h6">Orden</Typography>
									</TableCell>
									<TableCell>
										<Typography variant="h6">Icono</Typography>
									</TableCell>
									<TableCell>
										<Typography variant="h6">Texto</Typography>
									</TableCell>
									<TableCell align="center">
										<Typography variant="h6">Acciones</Typography>
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{rows.map((row) => (
									<Row
										key={row.mod_id}
										row={row}
										onDelete={handleDeleteClick}
										onEdit={handleEditClick}
									/>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</Paper>
			</ParentCard>

			{/* Modal Eliminar */}
			<Dialog open={openDeleteModal} onClose={handleCloseDeleteModal}>
				<DialogTitle>Eliminar módulo</DialogTitle>
				<DialogContent>
					<DialogContentText>
						¿Está seguro que desea eliminar el módulo{" "}
						<strong>{selectedRow?.mod_name}</strong>?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDeleteModal}>Cancelar</Button>
					<Button
						onClick={handleConfirmDelete}
						color="error"
						variant="contained"
					>
						Eliminar
					</Button>
				</DialogActions>
			</Dialog>

			{/* Modal Editar */}
			<Dialog
				open={openEditModal}
				onClose={handleCloseEditModal}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Editar Módulo</DialogTitle>
				<DialogContent>
					<TextField
						margin="dense"
						label="Nombre"
						fullWidth
						name="mod_name"
						value={editData.mod_name || ""}
						onChange={handleEditChange}
					/>
					<TextField
						margin="dense"
						label="Descripción"
						fullWidth
						name="mod_description"
						value={editData.mod_description || ""}
						onChange={handleEditChange}
					/>
					<TextField
						margin="dense"
						label="Orden"
						fullWidth
						name="mod_order"
						value={editData.mod_order || ""}
						onChange={handleEditChange}
					/>
					<TextField
						margin="dense"
						label="Nombre de ícono"
						fullWidth
						name="mod_icon_name"
						value={editData.mod_icon_name || ""}
						onChange={handleEditChange}
					/>
					<TextField
						margin="dense"
						label="Texto de menú"
						fullWidth
						name="mod_text_name"
						value={editData.mod_text_name || ""}
						onChange={handleEditChange}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseEditModal}>Cancelar</Button>
					<Button onClick={handleEditSave} variant="contained" color="primary">
						Guardar
					</Button>
				</DialogActions>
			</Dialog>
		</PageContainer>
	);
};

export default ModuleTableList;
