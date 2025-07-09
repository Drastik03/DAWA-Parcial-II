import React, { useEffect, useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Grid,
	Autocomplete,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE = "http://localhost:5000";

export default function DiseaseForm({ open, onClose, onSuccess, editDisease }) {
	const {
		register,
		handleSubmit,
		reset,
		control,
		setValue,
		formState: { errors },
	} = useForm();

	const [diseaseTypes, setDiseaseTypes] = useState([]);

	useEffect(() => {
		const fetchTypes = async () => {
			try {
				const res = await axios.get(`${API_BASE}/catalog/disease-type/list`, {
					headers: { tokenapp: Cookies.get("token") },
				});
				setDiseaseTypes(res?.data?.data?.data || []);
			} catch (err) {
				console.error("Error cargando tipos de enfermedad", err);
			}
		};

		fetchTypes();
	}, []);

	useEffect(() => {
		if (editDisease) {
			reset({
				dis_name: editDisease.dis_name || "",
				dis_description: editDisease.dis_description || "",
				dis_type_id: editDisease.dis_type_id || null,
			});
		} else {
			reset({
				dis_name: "",
				dis_description: "",
				dis_type_id: null,
			});
		}
	}, [editDisease, reset]);

	const onSubmit = async (data) => {
		try {
			const payload = {
				...data,
				dis_type_id: data.dis_type_id?.dst_id,
			};

			const endpoint = editDisease
				? `${API_BASE}/catalog/disease/update/${editDisease.dis_id}`
				: `${API_BASE}/catalog/disease/add`;

			const method = editDisease ? axios.patch : axios.post;

			await method(endpoint, payload, {
				headers: {
					tokenapp: Cookies.get("token"),
				},
			});

			onSuccess();
			onClose();
		} catch (err) {
			console.error("Error al guardar enfermedad", err);
			alert("Error al guardar enfermedad");
		}
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth scroll="paper">
			<DialogTitle>
				{editDisease ? "Editar Enfermedad" : "Nueva Enfermedad"}
			</DialogTitle>
			<DialogContent dividers>
				<form id="disease-form" onSubmit={handleSubmit(onSubmit)}>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Nombre"
								{...register("dis_name", {
									required: "El nombre es obligatorio",
									maxLength: {
										value: 100,
										message: "Máximo 100 caracteres",
									},
								})}
								error={!!errors.dis_name}
								helperText={errors.dis_name?.message}
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Descripción"
								multiline
								rows={3}
								{...register("dis_description")}
							/>
						</Grid>

						<Grid item xs={12}>
							<Controller
								name="dis_type_id"
								control={control}
								rules={{ required: "Debe seleccionar un tipo de enfermedad" }}
								render={({ field }) => (
									<Autocomplete
										{...field}
										options={diseaseTypes}
										getOptionLabel={(option) => option.dst_name || ""}
										isOptionEqualToValue={(option, value) =>
											option.dst_id === value?.dst_id
										}
										onChange={(_, value) => field.onChange(value)}
										renderInput={(params) => (
											<TextField
												{...params}
												label="Tipo de enfermedad"
												error={!!errors.dis_type_id}
												helperText={errors.dis_type_id?.message}
											/>
										)}
									/>
								)}
							/>
						</Grid>
					</Grid>
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancelar</Button>
				<Button type="submit" form="disease-form" variant="contained">
					Guardar
				</Button>
			</DialogActions>
		</Dialog>
	);
}
