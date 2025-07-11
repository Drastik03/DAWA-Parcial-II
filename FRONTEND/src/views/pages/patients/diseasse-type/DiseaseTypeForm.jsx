// DiseaseTypeForm.jsx
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

export default function DiseaseTypeForm({
	open,
	onClose,
	onSuccess,
	editDiseaseType,
}) {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm();

	useEffect(() => {
		if (editDiseaseType) {
			reset(editDiseaseType);
		} else {
			reset({
				dst_name: "",
				dst_description: "",
			});
		}
	}, [editDiseaseType, reset]);

	const onSubmit = async (data) => {
		try {
			const endpoint = editDiseaseType
				? `${API_BASE}/catalog/disease-type/update/${editDiseaseType.dst_id}`
				: `${API_BASE}/catalog/disease-type/add`;

			const method = editDiseaseType ? axios.patch : axios.post;

			await method(endpoint, data, {
				headers: {
					tokenapp: Cookies.get("token"),
				},
			});
			if (!editDiseaseType) {
				reset({
					dst_name: "",
					dst_description: "",
				});
			}

			onSuccess();
			onClose();
		} catch (err) {
			console.error("Error al guardar tipo de enfermedad", err);
			alert("Error al guardar tipo de enfermedad");
		}
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth scroll="paper">
			<DialogTitle>
				{editDiseaseType
					? "Editar Tipo de Enfermedad"
					: "Nuevo Tipo de Enfermedad"}
			</DialogTitle>
			<DialogContent dividers>
				<form id="disease-type-form" onSubmit={handleSubmit(onSubmit)}>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Nombre"
								{...register("dst_name", {
									required: "El nombre es obligatorio",
									maxLength: {
										value: 100,
										message: "Máximo 100 caracteres",
									},
								})}
								error={!!errors.dst_name}
								helperText={errors.dst_name?.message}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Descripción"
								multiline
								rows={3}
								{...register("dst_description")}
							/>
						</Grid>
					</Grid>
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancelar</Button>
				<Button type="submit" form="disease-type-form" variant="contained">
					Guardar
				</Button>
			</DialogActions>
		</Dialog>
	);
}
