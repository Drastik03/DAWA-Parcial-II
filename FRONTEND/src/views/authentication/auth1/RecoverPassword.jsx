import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Box, Button, Typography, TextField, Paper } from "@mui/material";
import { useEffect, useState } from "react";
import { Base64 } from "js-base64";
import axios from "axios";

const ResetPasswordPage = () => {
	const { token } = useParams();
	const navigate = useNavigate();

	const [userId, setUserId] = useState("");
	const [tokenTemp, setTokenTemp] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();

	useEffect(() => {
		if (!token) {
			alert("Token no válido");
			navigate("/auth/login");
			return;
		}

		try {
			const decoded = Base64.decode(token);
			const parsed = JSON.parse(decoded);
			setUserId(parsed.user_id);
			setTokenTemp(parsed.token_temp);
		} catch (err) {
			alert("El token es inválido o está corrupto.");
			navigate("/auth/login");
		}
	}, [token, navigate]);

	const onSubmit = async (data) => {
		try {
			const response = await axios.patch(
				"http://localhost:5173/security/change-password",
				{
					user_id: "0931112536",
					new_password: data.new_password,
					token_temp: tokenTemp,
				},
				{
					headers: { "Content-Type": "application/json" },
				},
			);

			const result = response.data;

			if (result.result) {
				alert("Contraseña actualizada con éxito");
				navigate("/auth/login");
			} else {
				alert("Error: " + result.message);
			}
		} catch (error) {
			alert("Error del servidor");
		}
	};

	return (
		<Box
			display="flex"
			justifyContent="center"
			alignItems="center"
			minHeight="80vh"
		>
			<Paper sx={{ padding: 4, width: "100%", maxWidth: 400 }}>
				<Typography variant="h5" fontWeight="bold" mb={2}>
					Restablecer contraseña
				</Typography>
				<form onSubmit={handleSubmit(onSubmit)}>
					<TextField
						label="Nueva contraseña"
						type="password"
						fullWidth
						margin="normal"
						{...register("new_password", { required: true, minLength: 6 })}
						error={!!errors.new_password}
						helperText={errors.new_password ? "Mínimo 6 caracteres" : ""}
					/>
					<Button type="submit" variant="contained" color="primary" fullWidth>
						Cambiar contraseña
					</Button>
				</form>
			</Paper>
		</Box>
	);
};

export default ResetPasswordPage;
