/** biome-ignore-all lint/nursery/useUniqueElementIds: <explicación> */
import React, { useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	FormControl,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "../../../../context/AuthContext";
import axios from "axios";
import Cookies from "js-cookie";

const EditTherapyType = ({ open, onClose, selectedTherapyType, onUpdate }) => {
	const { user } = useAuth();

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			tht_name: "",
			tht_description: "",
		},
	});

	useEffect(() => {
		if (selectedTherapyType) {
			reset({
				tht_name: selectedTherapyType.tht_name,
				tht_description: selectedTherapyType.tht_description,
			});
		} else {
			reset({
				tht_name: "",
				tht_description: "",
			});
		}
	}, [selectedTherapyType, reset]);

	const onSubmit = async (formData) => {
		try {
			if (!selectedTherapyType) return;

			const payload = {
				...formData,
				tht_id: selectedTherapyType.tht_id,
				user_created: user.user.user_login_id,
			};

			const res = await axios.patch(
				`${import.meta.env.VITE_API_URL}/admin/therapy-type/update`,
				payload,
				{
					headers: { tokenapp: Cookies.get("token") },
				},
			);
			  

			if (res.data.result) {
				onUpdate();
				onClose();
			} else {
				alert("Error al actualizar: " + res.data.message);
			}
		} catch (error) {
			alert("Error inesperado");
			console.error(error);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
			<DialogTitle>Editar Tipo de Terapia</DialogTitle>
			<DialogContent>
				<form id="edit-therapy-type-form" onSubmit={handleSubmit(onSubmit)}>
					<FormControl fullWidth sx={{ mt: 2 }}>
						<Controller
							name="tht_name"
							control={control}
							rules={{ required: "Nombre es requerido" }}
							render={({ field }) => (
								<TextField
									{...field}
									label="Nombre"
									error={!!errors.tht_name}
									helperText={errors.tht_name?.message}
								/>
							)}
						/>
					</FormControl>

					<FormControl fullWidth sx={{ mt: 2 }}>
						<Controller
							name="tht_description"
							control={control}
							rules={{ required: "Descripción es requerida" }}
							render={({ field }) => (
								<TextField
									{...field}
									label="Descripción"
									multiline
									minRows={2}
									error={!!errors.tht_description}
									helperText={errors.tht_description?.message}
								/>
							)}
						/>
					</FormControl>
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancelar</Button>
				<Button
					type="submit"
					form="edit-therapy-type-form"
					variant="contained"
					color="primary"
					disabled={!selectedTherapyType}
				>
					Guardar Cambios
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default EditTherapyType;
