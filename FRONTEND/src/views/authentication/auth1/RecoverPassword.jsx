import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
	Box,
	Button,
	Typography,
	TextField,
	Paper,
	InputAdornment,
	IconButton,
	Divider,
	Fade,
	Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Base64 } from "js-base64";
import axios from "axios";
import LockResetIcon from "@mui/icons-material/LockReset";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const ResetPasswordPage = () => {
	const { token } = useParams();
	const navigate = useNavigate();

	const [userId, setUserId] = useState("");
	const [tokenTemp, setTokenTemp] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm();

	useEffect(() => {
		if (!token) {
			alert("Token no válido");
			navigate("/auth/login");
			return;
		}

		try {
			const decodedToken = Base64.decode(token);
			const [id, tempToken] = decodedToken.split(":");
			if (!id || !tempToken) throw new Error("Token inválido");
			setUserId(id);
			setTokenTemp(tempToken);
		} catch (err) {
			alert("Error al decodificar el token");
			navigate("/auth/login");
		}
	}, [token, navigate]);

	const onSubmit = async (data) => {
		try {
			setErrorMsg("");
			const response = await axios.patch(
				"http://localhost:5000/security/change-password",
				{
					new_password: data.new_password,
					token_temp: tokenTemp,
					user_id: userId,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			if (response.data.result) {
				navigate("/auth/login");
			} else {
				setErrorMsg(response.data.message || "Error al cambiar la contraseña");
			}
		} catch (error) {
			setErrorMsg("Error de red o servidor");
		} finally {
			reset();
		}
	};

	return (
		<Box
			display="flex"
			justifyContent="center"
			alignItems="center"
			minHeight="100vh"
		>
			<Fade in>
				<Paper
					elevation={10}
					sx={{
						padding: 5,
						width: "100%",
						maxWidth: 420,
						borderRadius: 4,
						boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
					}}
				>
					<Box display="flex" flexDirection="column" alignItems="center" mb={2}>
						<LockResetIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
						<Typography variant="h3" fontWeight="bold" mb={0.5}>
							Restablecer Contraseña
						</Typography>
						<Typography variant="body1" color="text.secondary" align="center">
							Ingresa tu nueva contraseña para completar el proceso.
						</Typography>
					</Box>

					<Divider sx={{ mb: 3 }} />

					{errorMsg && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{errorMsg}
						</Alert>
					)}

					<form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
						<TextField
							label="Nueva contraseña"
							placeholder="Mínimo 6 caracteres"
							type={showPassword ? "text" : "password"}
							fullWidth
							margin="normal"
							variant="outlined"
							{...register("new_password", { required: true, minLength: 6 })}
							error={!!errors.new_password}
							helperText={
								errors.new_password
									? errors.new_password.type === "minLength"
										? "Debe tener al menos 6 caracteres"
										: "Este campo es requerido"
									: ""
							}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											aria-label="Mostrar u ocultar contraseña"
											onClick={() => setShowPassword((show) => !show)}
											edge="end"
										>
											{showPassword ? <VisibilityOff /> : <Visibility />}
										</IconButton>
									</InputAdornment>
								),
							}}
						/>

						<Button
							type="submit"
							variant="contained"
							color="primary"
							fullWidth
							size="large"
							sx={{
								mt: 2,
								borderRadius: 2,
								fontWeight: "bold",
								textTransform: "none",
							}}
							disabled={isSubmitting}
						>
							Cambiar contraseña
						</Button>
					</form>
				</Paper>
			</Fade>
		</Box>
	);
};

export default ResetPasswordPage;
