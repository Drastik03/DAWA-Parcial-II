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
import { EditPersonModal } from "./EditPersonModal";
import { DeleteOutlined, EditOutlined } from "@mui/icons-material";

const PersonRow = ({ person, onEdit, onDelete }) => {
	const [openDelete, setOpenDelete] = useState(false);
	const [openEdit, setOpenEdit] = useState(false);
	const [editData, setEditData] = useState({ ...person });

	const handleDeleteClick = () => setOpenDelete(true);
	const handleDeleteClose = () => setOpenDelete(false);
	const handleConfirmDelete = () => {
		onDelete(person.per_id);
		setOpenDelete(false);
	};

	const handleEditClick = () => setOpenEdit(true);
	const handleEditClose = () => {
		setEditData({ ...person });
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
			<TableRow key={person.per_id}>
				<TableCell>{person.per_id}</TableCell>
				<TableCell>{person.per_identification}</TableCell>
				<TableCell>{person.per_names}</TableCell>
				<TableCell>{person.per_surnames}</TableCell>
				<TableCell>{person.genre_name}</TableCell>
				<TableCell>{person.name_marital_status}</TableCell>
				<TableCell>{person.per_mail}</TableCell>
				<TableCell>
					{new Date(person.per_birth_date).toLocaleDateString()}
				</TableCell>
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
						<DeleteOutlined />
					</IconButton>
				</TableCell>
			</TableRow>

			<EditPersonModal
				openEdit={openEdit}
				handleEditClose={handleEditClose}
				onSave={(data) => {
					onEdit(data);
				}}
				editData={editData}
			/>

			{/* Delete Modal */}
			<Dialog open={openDelete} onClose={handleDeleteClose}>
				<DialogTitle>Confirmar desactivación</DialogTitle>
				<DialogContent>
					<DialogContentText>
						¿Está seguro que desea desactivar a {person.per_names}{" "}
						{person.per_surnames}?
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

export default PersonRow;
