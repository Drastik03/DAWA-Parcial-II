/* eslint-disable react/prop-types */
import { useState } from "react";
import {
	TableRow,
	TableCell,
	Button,
	Stack,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	IconButton,
} from "@mui/material";
import { DeleteOutline, EditOutlined } from "@mui/icons-material";
// import { EditUserModal } from "./EditUserModal";

const UserRow = ({ user, onEdit, onDelete }) => {
	const [openDelete, setOpenDelete] = useState(false);
	const [openEdit, setOpenEdit] = useState(false);
	const [editData, setEditData] = useState({ ...user });

	const handleDeleteClick = () => setOpenDelete(true);
	const handleDeleteClose = () => setOpenDelete(false);
	const handleConfirmDelete = () => {
		onDelete(user.user_id);
		setOpenDelete(false);
	};

	const handleEditClick = () => setOpenEdit(true);
	const handleEditClose = () => {
		setEditData({ ...user });
		setOpenEdit(false);
	};
	const handleEditChange = (e) => {
		setEditData({ ...editData, [e.target.name]: e.target.value });
	};
	const handleEditSave = () => {
		onEdit(editData);
		setOpenEdit(false);
	};

	return (
		<>
			<TableRow key={user.user_id}>
				<TableCell>{user.user_id}</TableCell>
				<TableCell>{user.user_login_id}</TableCell>
				<TableCell>{user.user_mail}</TableCell>
				<TableCell>{user.full_name}</TableCell>
				<TableCell>{user.rol_name}</TableCell>

				{/* ACCION EDITAR - ELIMINAR CON ICONOS */}
				<TableCell align="center">
					<IconButton
						color="primary"
						aria-label="editar"
						onClick={handleEditClick}
					>
						<EditOutlined />
					</IconButton>
					<IconButton
						color="error"
						aria-label="desactivar"
						onClick={handleDeleteClick}
					>
						<DeleteOutline />
					</IconButton>
				</TableCell>
			</TableRow>

			{/* Edit Modal */}
			{/* <EditUserModal
				handleEditChange={handleEditChange}
				handleEditClose={handleEditClose}
				handleEditSave={handleEditSave}
				openEdit={openEdit}
				editData={editData}
			/> */}

			{/* Delete Modal */}
			<Dialog open={openDelete} onClose={handleDeleteClose}>
				<DialogTitle>Confirmar desactivación</DialogTitle>
				<DialogContent>
					<DialogContentText>
						¿Está seguro que desea desactivar a {user.user_login_id}?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteClose} color="primary">
						Cancelar
					</Button>
					<Button
						onClick={handleConfirmDelete}
						color="error"
						variant="contained"
					>
						Confirmar
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default UserRow;
