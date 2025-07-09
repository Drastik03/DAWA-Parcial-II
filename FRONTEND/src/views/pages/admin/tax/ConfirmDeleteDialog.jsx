import React from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
} from "@mui/material";

export default function ConfirmDeleteDialog({
	open,
	onClose,
	onConfirm,
	title,
	message,
}) {
	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>{title}</DialogTitle>
			<DialogContent>
				<Typography>{message}</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancelar</Button>
				<Button onClick={onConfirm} color="error" variant="contained">
					Eliminar
				</Button>
			</DialogActions>
		</Dialog>
	);
}
