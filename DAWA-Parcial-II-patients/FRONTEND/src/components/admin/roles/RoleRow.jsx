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

const RoleRow = ({ role, onEdit, onDelete }) => {
    const [openDelete, setOpenDelete] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editData, setEditData] = useState({ ...role });

    const handleDeleteClick = () => setOpenDelete(true);
    const handleDeleteClose = () => setOpenDelete(false);
    const handleConfirmDelete = () => {
        onDelete(role.rol_id);
        setOpenDelete(false);
    };

    const handleEditClick = () => setOpenEdit(true);
    const handleEditClose = () => {
        setEditData({ ...role });
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
            <TableRow key={role.rol_id}>
                <TableCell>{role.rol_id}</TableCell>
                <TableCell>{role.rol_name}</TableCell>
                <TableCell>{role.rol_description}</TableCell>
                <TableCell>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            color="primary"
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
                    </Stack>
                </TableCell>
            </TableRow>

            {/* Edit Modal */}
            <Dialog open={openEdit} onClose={handleEditClose}>
                <DialogTitle>Editar Rol</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Modifique los datos del rol.
                    </DialogContentText>
                    <input
                        name="rol_name"
                        value={editData.rol_name}
                        onChange={handleEditChange}
                        placeholder="Nombre del rol"
                        style={{ width: "100%", margin: "8px 0" }}
                    />
                    <input
                        name="rol_description"
                        value={editData.rol_description}
                        onChange={handleEditChange}
                        placeholder="Descripción"
                        style={{ width: "100%", margin: "8px 0" }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditClose} color="primary">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleEditSave}
                        color="primary"
                        variant="contained"
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={openDelete} onClose={handleDeleteClose}>
                <DialogTitle>Confirmar desactivación</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Está seguro que desea desactivar el rol "{role.rol_name}"?
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

export default RoleRow;
