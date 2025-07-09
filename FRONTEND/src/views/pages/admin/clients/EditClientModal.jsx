import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Stack,
	Snackbar,
	Alert,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "../../../../context/AuthContext";

const EditClientModal = ({ open, onClose, clientData, onUpdate }) => {
	const [formData, setFormData] = useState({ ...clientData });
	const { user } = useAuth();
	console.log(user);

	const [alert, setAlert] = useState({
		open: false,
		message: "",
		severity: "success",
	});

	useEffect(() => {
		if (clientData) setFormData(clientData);
	}, [clientData]);

	const handleChange = (e) => {
		setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSubmit = async () => {
		try {
			const {
				cli_id,
				cli_person_id,
				cli_identification,
				cli_name,
				cli_address_bill,
				cli_mail_bill,
			} = formData;

			const payload = {
				cli_id,
				cli_person_id,
				cli_identification,
				cli_name,
				cli_address_bill,
				cli_mail_bill,
				user_modified: user.user.user_login_id,
			};
			console.log(formData);

			const res = await axios.patch(
				"http://localhost:5000/admin/client/update",
				payload,
				{ headers: { tokenapp: Cookies.get("token") } },
			);

			if (res.data.result) {
				setAlert({
					open: true,
					message: "Cliente actualizado",
					severity: "success",
				});
				onUpdate();
				onClose();
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
				message: "Error al actualizar",
				severity: "error",
			});
		}
	};

	return (
		<>
			<Dialog open={open} onClose={onClose} fullWidth>
				<DialogTitle>Editar Cliente</DialogTitle>
				<DialogContent>
					<Stack spacing={2} mt={1}>
						<TextField
							label="Identificación"
							name="cli_identification"
							value={formData?.cli_identification || ""}
							onChange={handleChange}
							fullWidth
						/>
						<TextField
							label="Nombre"
							name="cli_name"
							value={formData?.cli_name || ""}
							onChange={handleChange}
							fullWidth
						/>
						<TextField
							label="Dirección de Facturación"
							name="cli_address_bill"
							value={formData?.cli_address_bill || ""}
							onChange={handleChange}
							fullWidth
						/>
						<TextField
							label="Correo de Facturación"
							name="cli_mail_bill"
							value={formData?.cli_mail_bill || ""}
							onChange={handleChange}
							fullWidth
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>Cancelar</Button>
					<Button variant="contained" onClick={handleSubmit}>
						Guardar Cambios
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={alert.open}
				autoHideDuration={4000}
				onClose={() => setAlert({ ...alert, open: false })}
			>
				<Alert severity={alert.severity}>{alert.message}</Alert>
			</Snackbar>
		</>
	);
};

export default EditClientModal;
