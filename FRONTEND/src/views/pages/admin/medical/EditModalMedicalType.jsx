import React, { useEffect } from "react";
import {
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	FormControl,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "../../../../context/AuthContext";
import { updateMedicalPersonType } from "../../../../services/admin/medicaltypeperson";

const EditModalMedicalType = ({ open, onClose, selectedData, onUpdate }) => {
	const { user } = useAuth();

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			mpt_name: "",
			mpt_description: "",
		},
	});

	useEffect(() => {
		if (selectedData) {
			reset({
				mpt_name: selectedData.mpt_name || "",
				mpt_description: selectedData.mpt_description || "",
			});
		}
	}, [selectedData, reset]);

	const onSubmit = async (formData) => {
		try {
			const payload = {
				...formData,
				mpt_id: selectedData.mpt_id,
				user_created: user.user.user_login_id,
			};

			console.log(payload);

			const res = await updateMedicalPersonType(payload);

			if (res.result) {
				onUpdate();
				onClose();
			} else {
				alert("Error al actualizar: " + res.message);
			}
		} catch (error) {
			alert("Error inesperado al actualizar");
		}
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
			<DialogTitle>Editar Tipo de Personal Médico</DialogTitle>
			<DialogContent>
				<form id="edit-type-form" onSubmit={handleSubmit(onSubmit)}>
					<FormControl fullWidth sx={{ mt: 2 }} error={!!errors.mpt_name}>
						<Controller
							name="mpt_name"
							control={control}
							rules={{ required: "Nombre requerido" }}
							render={({ field }) => (
								<TextField
									{...field}
									label="Nombre"
									variant="outlined"
									error={!!errors.mpt_name}
									helperText={errors.mpt_name?.message}
								/>
							)}
						/>
					</FormControl>

					<FormControl
						fullWidth
						sx={{ mt: 2 }}
						error={!!errors.mpt_description}
					>
						<Controller
							name="mpt_description"
							control={control}
							rules={{ required: "Descripción requerida" }}
							render={({ field }) => (
								<TextField
									{...field}
									label="Descripción"
									variant="outlined"
									error={!!errors.mpt_description}
									helperText={errors.mpt_description?.message}
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
					form="edit-type-form"
					variant="contained"
					color="primary"
				>
					Actualizar
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default EditModalMedicalType;
