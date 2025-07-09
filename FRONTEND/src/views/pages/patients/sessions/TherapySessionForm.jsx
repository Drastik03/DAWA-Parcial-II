import React from "react";
import {
	TextField,
	Stack,
	Checkbox,
	FormControlLabel,
	Button,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import ProfessionalSelectAutocomplete from "./ProfessionalSelectAutocomplete";

const TherapySessionForm = ({
	inventory,
	professional,
	type,
	staff,
	onCreated,
}) => {
	const { control, handleSubmit, reset } = useForm();

	const onSubmit = async (data) => {
		if (!inventory || !professional || !type || !staff) {
			alert("Selecciona todos los datos necesarios de tablas previas.");
			return;
		}

		const payload = {
			sec_inv_id: inventory.id,
			sec_pro_id: professional.id,
			sec_ses_number: parseInt(data.sec_ses_number),
			sec_ses_agend_date: data.sec_ses_agend_date || null,
			sec_ses_exec_date: data.sec_ses_exec_date || null,
			sec_typ_id: type.id,
			sec_med_staff_id: staff.id,
			ses_consumed: data.ses_consumed || false,
			ses_state: data.ses_state || false,
			user_created: data.user_created,
		};

		try {
			await axios.post("/api/therapy-session", payload);
			reset();
			onCreated();
		} catch (error) {
			console.error("Error al registrar sesión", error);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Stack spacing={2} mt={2}>
				<Controller
					name="sec_ses_number"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="Número de sesión"
							type="number"
							required
						/>
					)}
				/>
				<Controller
					name="professional"
					control={control}
					rules={{ required: true }}
					render={({ field }) => (
						<ProfessionalSelectAutocomplete
							value={field.value}
							onChange={field.onChange}
						/>
					)}
				/>
				<Controller
					name="sec_ses_agend_date"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="Fecha agendada"
							type="datetime-local"
							InputLabelProps={{ shrink: true }}
						/>
					)}
				/>
				<Controller
					name="sec_ses_exec_date"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="Fecha ejecutada"
							type="datetime-local"
							InputLabelProps={{ shrink: true }}
						/>
					)}
				/>
				<Controller
					name="ses_consumed"
					control={control}
					defaultValue={false}
					render={({ field }) => (
						<FormControlLabel
							control={<Checkbox {...field} checked={field.value} />}
							label="Sesión consumida"
						/>
					)}
				/>
				<Controller
					name="ses_state"
					control={control}
					defaultValue={true}
					render={({ field }) => (
						<FormControlLabel
							control={<Checkbox {...field} checked={field.value} />}
							label="Sesión activa"
						/>
					)}
				/>
				<Controller
					name="user_created"
					control={control}
					render={({ field }) => (
						<TextField {...field} label="Usuario creador" required />
					)}
				/>
				<Button type="submit" variant="contained">
					Registrar sesión
				</Button>
			</Stack>
		</form>
	);
};

export default TherapySessionForm;
