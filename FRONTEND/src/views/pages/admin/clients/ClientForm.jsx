/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
import React, { useState, useEffect } from "react";
import {
	TextField,
	Button,
	Paper,
	Stack,
	Snackbar,
	Alert,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "../../../../context/AuthContext";

export const ClientForm = ({ selectedPerson, onCreated }) => {
	const [formData, setFormData] = useState({
		cli_person_id: 0,
		cli_identification: "",
		cli_name: "",
		cli_address_bill: "",
		cli_mail_bill: "",
		user_created: "",
	});
	const { user } = useAuth();
	const [alert, setAlert] = useState({
		open: false,
		message: "",
		severity: "success",
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (selectedPerson) {
			setFormData({
				cli_person_id: selectedPerson.per_id,
				cli_identification: selectedPerson.per_identification,
				cli_name: `${selectedPerson.per_names} ${selectedPerson.per_surnames}`,
				cli_address_bill: selectedPerson.per_address || "",
				cli_mail_bill: selectedPerson.per_mail || "",
				user_created: user.user.user_login_id,
			});
		}
	}, [selectedPerson]);

	const handleChange = (e) => {
		setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const token = Cookies.get("token");
			const res = await axios.post(
				`${import.meta.env.VITE_API_URL}/admin/client/insert`,
				formData,
				{
					headers: { tokenapp: token },
				},
			);

			if (res.data.result) {
				setAlert({
					open: true,
					message: "Cliente creado exitosamente",
					severity: "success",
				});
				onCreated();
				setFormData({
					cli_person_id: 0,
					cli_identification: "",
					cli_name: "",
					cli_address_bill: "",
					cli_mail_bill: "",
					user_created: "",
				});
			} else {
				setAlert({
					open: true,
					message: res.data.message || "Error al crear cliente",
					severity: "error",
				});
			}
		} catch (error) {
			setAlert({
				open: true,
				message: "Error de conexión o servidor",
				severity: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Paper sx={{ p: 3, mt: 3 }}>
			<form onSubmit={handleSubmit}>
				<Stack spacing={2}>
					<TextField
						label="Identificación"
						name="cli_identification"
						value={formData.cli_identification}
						onChange={handleChange}
						disabled
						fullWidth
					/>
					<TextField
						label="Nombre"
						name="cli_name"
						value={formData.cli_name}
						onChange={handleChange}
						disabled
						fullWidth
					/>
					<TextField
						label="Dirección de Facturación"
						name="cli_address_bill"
						value={formData.cli_address_bill}
						onChange={handleChange}
						fullWidth
					/>
					<TextField
						label="Correo de Facturación"
						name="cli_mail_bill"
						value={formData.cli_mail_bill}
						onChange={handleChange}
						fullWidth
					/>
					<Button
						type="submit"
						variant="contained"
						disabled={loading || !formData.cli_person_id}
					>
						{loading ? "Guardando..." : "Agregar Cliente"}
					</Button>
				</Stack>
			</form>

			<Snackbar
				open={alert.open}
				autoHideDuration={3000}
				onClose={() => setAlert({ ...alert, open: false })}
			>
				<Alert severity={alert.severity}>{alert.message}</Alert>
			</Snackbar>
		</Paper>
	);
};
