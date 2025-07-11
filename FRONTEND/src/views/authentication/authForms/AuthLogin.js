/** biome-ignore-all lint/nursery/useUniqueElementIds: <explanation> */
import {
	Box,
	Typography,
	FormGroup,
	FormControlLabel,
	Button,
	Stack,
	Alert,
} from "@mui/material";
import { Link } from "react-router-dom";

import CustomCheckbox from "../../../components/forms/theme-elements/CustomCheckbox";
import CustomTextField from "../../../components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "../../../components/forms/theme-elements/CustomFormLabel";
import { useLoginForm } from "../../../hooks/useLoginForm";

// eslint-disable-next-line react/prop-types
const AuthLogin = ({ title, subtitle, subtext }) => {
	{
		/*
      USAR REACT-HOOK-FORM
  */
	}
	const { register, errors, handleSubmit, onSubmit, errorMsg } = useLoginForm();
	return (
		<>
			{title
				? <Typography fontWeight="700" variant="h3" mb={1}>
						{title}
					</Typography>
				: null}

			{subtext}
			<form>
				{errorMsg && (
					<Alert variant="filled" severity="error">
						{errorMsg}
					</Alert>
				)}

				<Box>
					<CustomFormLabel htmlFor="login_user">Usuario</CustomFormLabel>
					<CustomTextField
						id="username"
						name="login_user"
						{...register("login_user", { required: true })}
						variant="outlined"
						fullWidth
					/>
					{errors.login_user && (
						<Typography color="crimson">El usuario es requerido</Typography>
					)}
				</Box>
				<Box>
					<CustomFormLabel htmlFor="login_password">Contraseña</CustomFormLabel>
					<CustomTextField
						id="login_password"
						type="password"
						variant="outlined"
						fullWidth
						{...register("login_password", { required: true })}
					/>
					{errors.login_password && (
						<Typography color="crimson">La contraseña es requerida</Typography>
					)}
				</Box>
				<Stack
					justifyContent="space-between"
					direction="row"
					alignItems="center"
					my={2}
				>
					<FormGroup>
						<FormControlLabel
							control={<CustomCheckbox defaultChecked />}
							label="Recuerdame"
						/>
					</FormGroup>
					<Typography
						component={Link}
						to="/auth/forgot-password"
						fontWeight="500"
						sx={{
							textDecoration: "none",
							color: "primary.main",
						}}
					>
						Olvidaste tú constraseña?
					</Typography>
				</Stack>
				<Box>
					<Button
						color="primary"
						variant="contained"
						size="large"
						fullWidth
						//component={Link}
						//to="/"
						type="submit"
						onClick={handleSubmit(onSubmit)}
					>
						Ingresar
					</Button>
				</Box>
			</form>
			{subtitle}
		</>
	);
};

export default AuthLogin;
