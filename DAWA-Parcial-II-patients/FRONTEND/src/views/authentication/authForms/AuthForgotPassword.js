/** biome-ignore-all lint/nursery/useUniqueElementIds: <explanation> */
import { useState } from "react";
import { Alert, Button, Stack } from "@mui/material";

import CustomTextField from "../../../components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "../../../components/forms/theme-elements/CustomFormLabel";
import { useForm } from "react-hook-form";
import axios from "axios";
import { IconX } from "@tabler/icons";

const AuthForgotPassword = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();
	const [message, setMessage] = useState("");

	const onSubmit = async (data) => {
		console.log("Form submitted with data:", data);
		try {
			const res = await axios.patch(
				"http://localhost:5000/security/recover-password",
				{
					user_mail: data.email,
				},
			);
			if (!res.success) {
				setMessage(res.message || "Error al enviar el correo");
			}
			setMessage("Se enviará un enlace para restablecer la contraseña.");
		} catch (error) {
			console.error("Error submitting form:", error);
		}
	};

	return (
		<>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Stack mt={4} spacing={2}>
					{message && (
						<Alert
							severity="success"
							icon={<IconX size={20} stroke={1.5} color="inherit" />}
							variant="filled"
							sx={{
								mb: 2,
								"& .MuiAlert-icon": {
									color: "inherit",
								},
							}}
						>
							{message && (
								<Stack mt={2} sx={{ color: "text.secondary" }}>
									{message}
								</Stack>
							)}
						</Alert>
					)}

					<CustomFormLabel htmlFor="reset-email">Email Address</CustomFormLabel>
					<CustomTextField
						id="reset-email"
						variant="outlined"
						fullWidth
						{...register("email", {
							required: "El email es obligatorio",
							pattern: {
								value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
								message: "Ingressa un email válido",
							},
						})}
						error={!!errors.email}
						helperText={errors.email ? errors.email.message : ""}
					/>

					<Button
						color="primary"
						variant="contained"
						size="large"
						fullWidth
						type="submit"
					>
						Forgot Password
					</Button>
				</Stack>
			</form>
		</>
	);
};

export default AuthForgotPassword;
