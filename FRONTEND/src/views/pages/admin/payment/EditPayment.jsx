/** biome-ignore-all lint/nursery/useUniqueElementIds: <explanation> */
import React, { useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	FormControlLabel,
	Switch,
	FormControl,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "../../../../context/AuthContext";
import axios from "axios";
import Cookies from "js-cookie";

const EditPayment = ({ open, onClose, selectedPaymentType, onUpdate }) => {
	const { user } = useAuth();

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			pme_name: "",
			pme_description: "",
			pme_require_references: false,
			pme_require_picture_proff: false,
		},
	});

	useEffect(() => {
		if (selectedPaymentType) {
			reset({
				pme_name: selectedPaymentType.pme_name,
				pme_description: selectedPaymentType.pme_description,
				pme_require_references: selectedPaymentType.pme_require_references,
				pme_require_picture_proff:
					selectedPaymentType.pme_require_picture_proff,
				user_created: selectedPaymentType.user_created,
			});
		}
	}, [selectedPaymentType, reset]);

	const onSubmit = async (formData) => {
		try {
			const payload = {
				pme_id: selectedPaymentType.pme_id,
				pme_name: formData.pme_name,
				pme_description: formData.pme_description,
				pme_require_references: formData.pme_require_references,
				pme_require_picture_proff: formData.pme_require_picture_proff,
				user_modified: user.user.user_login_id,
			};
			const res = await axios.patch(
				`${import.meta.env.VITE_API_URL}/admin/payment_method/update`,
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
		}
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
			<DialogTitle>Editar Tipo de Pago</DialogTitle>
			<DialogContent>
				<form id="edit-payment-type-form" onSubmit={handleSubmit(onSubmit)}>
					<FormControl fullWidth sx={{ mt: 2 }}>
						<Controller
							name="pme_name"
							control={control}
							rules={{ required: "Nombre es requerido" }}
							render={({ field }) => (
								<TextField
									{...field}
									label="Nombre"
									error={!!errors.pme_name}
									helperText={errors.pme_name?.message}
								/>
							)}
						/>
					</FormControl>

					<FormControl fullWidth sx={{ mt: 2 }}>
						<Controller
							name="pme_description"
							control={control}
							rules={{ required: "Descripción es requerida" }}
							render={({ field }) => (
								<TextField
									{...field}
									label="Descripción"
									multiline
									minRows={2}
									error={!!errors.pme_description}
									helperText={errors.pme_description?.message}
								/>
							)}
						/>
					</FormControl>

					<FormControlLabel
						control={
							<Controller
								name="pme_require_references"
								control={control}
								render={({ field }) => (
									<Switch {...field} checked={field.value} />
								)}
							/>
						}
						label="Requiere referencias"
					/>

					<FormControlLabel
						control={
							<Controller
								name="pme_require_picture_proff"
								control={control}
								render={({ field }) => (
									<Switch {...field} checked={field.value} />
								)}
							/>
						}
						label="Requiere comprobante"
					/>
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancelar</Button>
				<Button
					type="submit"
					form="edit-payment-type-form"
					variant="contained"
					color="primary"
					disabled={!selectedPaymentType}
				>
					Guardar Cambios
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default EditPayment;
