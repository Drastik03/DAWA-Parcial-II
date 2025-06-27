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
} from "@mui/material";
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
				<TableCell>{user.user_person_id}</TableCell>
				<TableCell>{user.user_login_id}</TableCell>
				<TableCell>{user.user_mail}</TableCell>
				<TableCell>
					<Stack direction="row" spacing={1}>
						<Button
							variant="outlined"
							color="warning"
							size="small"
							onClick={handleEditClick}
						>
							Editar
						</Button>
						<Button
							variant="outlined"
							color="error"
							size="small"
							onClick={handleDeleteClick}
						>
							Desactivar
						</Button>
						{/*ACCION PARA ASIGNAR ROLES*/}
						<Button
							variant="outlined"
							color="secondary"
							size="small"
							onClick={() => console.log("Asignar roles a", user.user_login_id)}
						>
							{/*icono */}
							Asignar Roles
						</Button>
					</Stack>
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
