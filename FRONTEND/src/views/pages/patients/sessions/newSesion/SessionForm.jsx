/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
/** biome-ignore-all lint/nursery/useUniqueElementIds: <explanation> */
import React, { useEffect, useState } from "react";
import {
	Grid,
	TextField,
	Button,
	Snackbar,
	Alert,
	Autocomplete,
	FormControlLabel,
	Checkbox,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "../../../../../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL; 
export default function SessionForm({
	open,
	onClose,
	inventarios,
	productos,
	tiposSesion,
	personalMedico,
	onCreated,
	editSession,
}) {
	const {
		handleSubmit,
		control,
		reset,
		setValue,
		formState: { errors },
	} = useForm({
		defaultValues: {
			sec_inv_id: null,
			sec_pro_id: null,
			sec_ses_number: "",
			sec_ses_agend_date: "",
			sec_ses_exec_date: "",
			sec_typ_id: null,
			sec_med_staff_id: null,
			ses_consumed: false,
			ses_state: false,
		},
	});

	const { user } = useAuth();

	const [alert, setAlert] = useState({
		open: false,
		message: "",
		severity: "success",
	});

	const parseDateToInput = (str) => {
		if (!str) return "";
		const [datePart, timePart] = str.split(" ");
		const [day, month, year] = datePart.split("/");
		const [hour, min] = timePart.split(":");
		return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour}:${min}`;
	};

	useEffect(() => {
		if (
			editSession &&
			inventarios.length > 0 &&
			productos.length > 0 &&
			tiposSesion.length > 0 &&
			personalMedico.length > 0
		) {
			setValue(
				"sec_inv_id",
				inventarios.find((i) => i.inv_id === editSession.sec_inv_id) || null,
			);
			setValue(
				"sec_pro_id",
				productos.find((p) => p.pro_id === editSession.sec_pro_id) || null,
			);
			setValue("sec_ses_number", editSession.sec_ses_number || "");
			setValue(
				"sec_ses_agend_date",
				parseDateToInput(editSession.sec_ses_agend_date),
			);
			setValue(
				"sec_ses_exec_date",
				parseDateToInput(editSession.sec_ses_exec_date),
			);
			setValue(
				"sec_typ_id",
				tiposSesion.find((t) => t.tht_id === editSession.sec_typ_id) || null,
			);
			setValue(
				"sec_med_staff_id",
				personalMedico.find((m) => m.med_id === editSession.sec_med_staff_id) ||
					null,
			);
			setValue("ses_consumed", !!editSession.ses_consumed);
			setValue("ses_state", !!editSession.ses_state);
		} else {
			reset();
		}
	}, [
		editSession,
		inventarios,
		productos,
		tiposSesion,
		personalMedico,
		setValue,
		reset,
	]);

	const toBackendDateTime = (datetimeLocalStr) => {
		if (!datetimeLocalStr) return null;
		let dateTime = datetimeLocalStr.replace("T", " ");
		if (dateTime.length === 16) {
			dateTime += ":00";
		}
		return dateTime;
	};

	const onSubmit = async (data) => {
		try {
			const payload = {
				sec_inv_id: data.sec_inv_id?.inv_id || null,
				sec_pro_id: data.sec_pro_id?.pro_id || null,
				sec_ses_number: parseInt(data.sec_ses_number),
				sec_ses_agend_date: toBackendDateTime(data.sec_ses_agend_date),
				sec_ses_exec_date: toBackendDateTime(data.sec_ses_exec_date) || null,
				sec_typ_id: data.sec_typ_id?.tht_id || null,
				sec_med_staff_id: data.sec_med_staff_id?.med_id || null,
				ses_consumed: data.ses_consumed,
				ses_state: data.ses_state,
			};

			if (!editSession) {
				payload.user_created = user.user.user_login_id;
			} else {
				payload.user_modified = user.user.user_login_id;
			}

			const url = editSession
				? `${API_BASE}/clinic/TherapySession/update/${editSession.sec_id}`
				: `${API_BASE}/clinic/TherapySession/add`;

			const method = editSession ? "patch" : "post";

			const res = await axios[method](url, payload, {
				headers: { tokenapp: Cookies.get("token") },
			});

			if (res.data.result) {
				setAlert({
					open: true,
					message: editSession
						? "Sesión actualizada correctamente"
						: "Sesión registrada correctamente",
					severity: "success",
				});
				reset();
				if (onCreated) onCreated();
				onClose();
			} else {
				setAlert({
					open: true,
					message: res.data.message || "Error al guardar sesión",
					severity: "error",
				});
			}
		} catch (error) {
			console.error(error);
			setAlert({
				open: true,
				message: "Error en la conexión o servidor",
				severity: "error",
			});
		}
	};

	const renderAutocomplete = ({
		name,
		label,
		options = [],
		getOptionLabel,
		getOptionId,
		error,
		helperText,
	}) => (
		<Controller
			name={name}
			control={control}
			rules={{ required: `Seleccione ${label.toLowerCase()}` }}
			render={({ field }) => {
				const selected = Array.isArray(options)
					? options.find(
							(opt) => getOptionId(opt) === getOptionId(field.value),
						) || null
					: null;
				return (
					<Autocomplete
						options={options}
						getOptionLabel={getOptionLabel}
						isOptionEqualToValue={(opt, val) =>
							getOptionId(opt) === getOptionId(val)
						}
						value={selected}
						onChange={(_, value) => field.onChange(value)}
						renderInput={(params) => (
							<TextField
								{...params}
								label={label}
								error={!!error}
								helperText={helperText}
								required
							/>
						)}
					/>
				);
			}}
		/>
	);

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>
				{editSession ? "Editar Sesión" : "Registrar Sesión"}
			</DialogTitle>
			<DialogContent>
				<form id="session-form" onSubmit={handleSubmit(onSubmit)} noValidate>
					<Grid container spacing={2} mt={0}>
						<Grid item xs={12} sm={6}>
							{renderAutocomplete({
								name: "sec_inv_id",
								label: "Factura / Paciente",
								options: inventarios,
								getOptionLabel: (o) =>
									`${o.inv_number} - ${o.full_name || o.client_name || "N/A"}`,
								getOptionId: (o) => o?.inv_id,
								error: errors.sec_inv_id,
								helperText: errors.sec_inv_id?.message,
							})}
						</Grid>

						<Grid item xs={12} sm={6}>
							{renderAutocomplete({
								name: "sec_pro_id",
								label: "Producto",
								options: productos,
								getOptionLabel: (o) => o.pro_name || "",
								getOptionId: (o) => o?.pro_id,
								error: errors.sec_pro_id,
								helperText: errors.sec_pro_id?.message,
							})}
						</Grid>

						<Grid item xs={12} sm={6}>
							<Controller
								name="sec_ses_number"
								control={control}
								rules={{
									required: "Número de sesión es requerido",
									min: { value: 1, message: "Mínimo 1" },
								}}
								render={({ field }) => (
									<TextField
										{...field}
										label="Número de Sesión"
										type="number"
										fullWidth
										required
										error={!!errors.sec_ses_number}
										helperText={errors.sec_ses_number?.message}
										inputProps={{ min: 1 }}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Controller
								name="sec_ses_agend_date"
								control={control}
								rules={{ required: "Fecha agendada requerida" }}
								render={({ field }) => (
									<TextField
										{...field}
										label="Fecha Agendada"
										type="datetime-local"
										InputLabelProps={{ shrink: true }}
										fullWidth
										required
										error={!!errors.sec_ses_agend_date}
										helperText={errors.sec_ses_agend_date?.message}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Controller
								name="sec_ses_exec_date"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Fecha Ejecución"
										type="datetime-local"
										InputLabelProps={{ shrink: true }}
										fullWidth
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							{renderAutocomplete({
								name: "sec_typ_id",
								label: "Tipo de Terapia",
								options: tiposSesion,
								getOptionLabel: (o) => o.tht_name || "",
								getOptionId: (o) => o?.tht_id,
								error: errors.sec_typ_id,
								helperText: errors.sec_typ_id?.message,
							})}
						</Grid>

						<Grid item xs={12} sm={6}>
							{renderAutocomplete({
								name: "sec_med_staff_id",
								label: "Personal Médico",
								options: personalMedico,
								getOptionLabel: (o) =>
									`${o.person_names ?? ""} ${o.person_surnames ?? ""}`.trim(),
								getOptionId: (o) => o?.med_id,
								error: errors.sec_med_staff_id,
								helperText: errors.sec_med_staff_id?.message,
							})}
						</Grid>

						<Grid item xs={12} sm={6}>
							<Controller
								name="ses_consumed"
								control={control}
								render={({ field }) => (
									<FormControlLabel
										control={
											<Checkbox
												checked={field.value}
												onChange={(e) => field.onChange(e.target.checked)}
											/>
										}
										label="Sesión Consumida"
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Controller
								name="ses_state"
								control={control}
								render={({ field }) => (
									<FormControlLabel
										control={
											<Checkbox
												checked={field.value}
												onChange={(e) => field.onChange(e.target.checked)}
											/>
										}
										label="Estado"
									/>
								)}
							/>
						</Grid>
					</Grid>
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancelar</Button>
				<Button type="submit" form="session-form" variant="contained">
					{editSession ? "Actualizar" : "Registrar"}
				</Button>
			</DialogActions>

			<Snackbar
				open={alert.open}
				autoHideDuration={3000}
				onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
			>
				<Alert
					severity={alert.severity}
					onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
				>
					{alert.message}
				</Alert>
			</Snackbar>
		</Dialog>
	);
}
