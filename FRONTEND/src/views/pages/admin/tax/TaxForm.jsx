import React, { useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Grid,
} from "@mui/material";
import { useForm } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE = import.meta.env.VITE_API_URL;

export default function TaxForm({ open, onClose, onSuccess, editTax }) {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm();

	useEffect(() => {
		if (editTax) {
			reset(editTax);
		} else {
			reset({
				tax_name: "",
				tax_percentage: "",
				tax_description: "",
			});
		}
	}, [editTax, reset]);

	const onSubmit = async (data) => {
		try {
			if (editTax) {
				data.tax_id = editTax.tax_id;
			}
			const payload = {
				tax_id: data.tax_id,
				tax_name: data.tax_name,
				tax_percentage: data.tax_percentage,
				tax_description: data.tax_description || "",
			};

			const endpoint = editTax
				? `${API_BASE}/admin/tax/update`
				: `${API_BASE}/admin/tax/insert`;

			const method = editTax ? axios.patch : axios.post;

			const res = await method(endpoint, payload, {
				headers: { tokenapp: Cookies.get("token") },
			});

			onSuccess();
			onClose();
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth scroll="paper">
			<DialogTitle>
				{editTax ? "Editar Impuesto" : "Nuevo Impuesto"}
			</DialogTitle>
			<DialogContent dividers>
				<form id="tax-form" onSubmit={handleSubmit(onSubmit)}>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Nombre"
								{...register("tax_name", {
									required: "El nombre es obligatorio",
									maxLength: {
										value: 50,
										message: "Máximo 50 caracteres",
									},
								})}
								error={!!errors.tax_name}
								helperText={errors.tax_name?.message}
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								fullWidth
								type="number"
								label="Porcentaje (%)"
								inputProps={{
									step: "0.01",
									min: 0,
								}}
								{...register("tax_percentage", {
									required: "El porcentaje es obligatorio",
									valueAsNumber: true,
									min: {
										value: 0,
										message: "No se permiten valores negativos",
									},
									max: {
										value: 100,
										message: "No debe superar el 100%",
									},
								})}
								error={!!errors.tax_percentage}
								helperText={errors.tax_percentage?.message}
							/>
						</Grid>

						<Grid item xs={12} sx={{ pb: 1 }}>
							<TextField
								fullWidth
								label="Descripción"
								multiline
								rows={3}
								{...register("tax_description")}
							/>
						</Grid>
					</Grid>
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancelar</Button>
				<Button type="submit" form="tax-form" variant="contained">
					Guardar
				</Button>
			</DialogActions>
		</Dialog>
	);
}
