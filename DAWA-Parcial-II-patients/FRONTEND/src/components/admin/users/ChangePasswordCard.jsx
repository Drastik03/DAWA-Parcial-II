import {
	Dialog,
	DialogTitle,
	DialogContent,
	Button,
	Stack,
	Alert,
	IconButton,
	Typography,
	Divider,
	Box,
	Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import Cookies from "js-cookie";
import CustomTextField from "../../forms/theme-elements/CustomTextField";
import CustomFormLabel from "../../forms/theme-elements/CustomFormLabel";

const ChangePasswordModal = ({ open, onClose }) => {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm();

	const { user } = useAuth();

	const [responseMsg, setResponseMsg] = useState("");
	const [isError, setIsError] = useState(false);

	const onSubmit = async (data) => {
		if (data.newPassword !== data.confirmPassword) {
			setResponseMsg("Las nuevas contraseñas no coinciden.");
			setIsError(true);
			return;
		}

		try {
			const res = await axios.patch(
				"http://localhost:5000/user/change-password",
				{
					oldPassword: data.oldPassword,
					newPassword: data.newPassword,
					user_id: user.user.user_id,
				},
				{
					headers: {
						"Content-Type": "application/json",
						tokenapp: Cookies.get("token"),
					},
				},
			);

			if (res.data.result) {
				setResponseMsg("Contraseña actualizada exitosamente.");
				setIsError(false);
				reset();
			} else {
				setResponseMsg(res.data.message || "Error al cambiar la contraseña.");
				setIsError(true);
			}
		} catch (err) {
			console.error(err);
			setResponseMsg("Error de conexión con el servidor.");
			setIsError(true);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
			<DialogTitle
				sx={{ p: 3, pb: 2, bgcolor: "primary.main", color: "white" }}
			>
				<Typography variant="h6" fontWeight={600}>
					Cambiar Contraseña
				</Typography>
				<IconButton
					aria-label="close"
					onClick={onClose}
					sx={{
						position: "absolute",
						right: 12,
						top: 12,
						color: "white",
						bgcolor: "primary.dark",
						"&:hover": { bgcolor: "primary.light" },
					}}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<Divider />
			<DialogContent sx={{ p: 3 }}>
				<Box
					component="form"
					onSubmit={handleSubmit(onSubmit)}
					noValidate
					autoComplete="off"
				>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<CustomFormLabel>Contraseña Actual</CustomFormLabel>
							<CustomTextField
								type="password"
								fullWidth
								{...register("oldPassword", { required: true })}
								error={!!errors.oldPassword}
								helperText={errors.oldPassword && "Campo requerido"}
							/>
						</Grid>
						<Grid item xs={12}>
							<CustomFormLabel>Nueva Contraseña</CustomFormLabel>
							<CustomTextField
								type="password"
								fullWidth
								{...register("newPassword", {
									required: true,
									minLength: { value: 6, message: "Mínimo 6 caracteres" },
								})}
								error={!!errors.newPassword}
								helperText={
									errors.newPassword
										? errors.newPassword.message || "Campo requerido"
										: ""
								}
							/>
						</Grid>
						<Grid item xs={12}>
							<CustomFormLabel>Confirmar Nueva Contraseña</CustomFormLabel>
							<CustomTextField
								type="password"
								fullWidth
								{...register("confirmPassword", { required: true })}
								error={!!errors.confirmPassword}
								helperText={errors.confirmPassword && "Campo requerido"}
							/>
						</Grid>
						<Grid item xs={12}>
							<Button
								variant="contained"
								color="primary"
								type="submit"
								disabled={isSubmitting}
								sx={{
									mt: 1,
									py: 1.2,
									fontWeight: 600,
									letterSpacing: 1,
									boxShadow: 2,
								}}
								fullWidth
							>
								Cambiar Contraseña
							</Button>
						</Grid>
						{responseMsg && (
							<Grid item xs={12}>
								<Alert
									severity={isError ? "error" : "success"}
									variant="filled"
									sx={{ mt: 1 }}
								>
									{responseMsg}
								</Alert>
							</Grid>
						)}
					</Grid>
				</Box>
			</DialogContent>
		</Dialog>
	);
};

export default ChangePasswordModal;
