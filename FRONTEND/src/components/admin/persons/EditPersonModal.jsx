/* eslint-disable react/prop-types */
import { useState } from 'react';
import {
    Modal,
    Box,
    Typography,
    Stack,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
};

export const EditPersonModal = ({
    openEdit,
    handleEditClose,
    handleEditSave,
    handleEditChange,
    editData = {}
}) => {
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleSaveClick = () => {
        setConfirmOpen(true);
    };

    const handleConfirmClose = () => {
        setConfirmOpen(false);
    };

    const handleConfirmSave = () => {
        setConfirmOpen(false);
        handleEditSave();
    };

    return (
        <>
            <Modal open={openEdit} onClose={handleEditClose}>
                <Box sx={style}>
                    <Typography variant="h6" component="h2" mb={2}>
                        Editar Persona
                    </Typography>
                    <Stack spacing={2}>
                        <TextField
                            label="Identificación"
                            name="per_identification"
                            value={editData.per_identification || ''}
                            onChange={handleEditChange}
                            fullWidth
                        />
                        <TextField
                            label="Nombres"
                            name="per_names"
                            value={editData.per_names || ''}
                            onChange={handleEditChange}
                            fullWidth
                        />
                        <TextField
                            label="Apellidos"
                            name="per_surnames"
                            value={editData.per_surnames || ''}
                            onChange={handleEditChange}
                            fullWidth
                        />
                        <TextField
                            label="Género"
                            name="genre_name"
                            value={editData.genre_name || ''}
                            onChange={handleEditChange}
                            fullWidth
                        />
                        <TextField
                            label="Estado Civil"
                            name="name_marital_status"
                            value={editData.name_marital_status || ''}
                            onChange={handleEditChange}
                            fullWidth
                        />
                        <TextField
                            label="Correo"
                            name="per_mail"
                            value={editData.per_mail || ''}
                            onChange={handleEditChange}
                            fullWidth
                        />
                        <TextField
                            label="Fecha de Nacimiento"
                            name="per_birth_date"
                            value={editData.per_birth_date || ''}
                            onChange={handleEditChange}
                            fullWidth
                            type="date"
                            InputLabelProps={{ shrink: true }}
                        />
                        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
                            <Button onClick={handleEditClose} color="primary">
                                Cancelar
                            </Button>
                            <Button onClick={handleSaveClick} color="primary" variant="contained">
                                Guardar
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Modal>
            <Dialog open={confirmOpen} onClose={handleConfirmClose}>
                <DialogTitle>Confirmar cambios</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro que deseas guardar los cambios?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmClose} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmSave} color="primary" variant="contained">
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
