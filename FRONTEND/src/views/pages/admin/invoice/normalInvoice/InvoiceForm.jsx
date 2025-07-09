import React, { useEffect, useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Grid,
	TextField,
	Button,
	Autocomplete,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "../../../../../context/AuthContext";

const API_BASE = "http://localhost:5000";

function formatDateToDatetimeLocal(dateStr) {
	if (!dateStr) return "";
	let dateObj;
	if (dateStr.includes("/")) {
		const [datePart, timePart] = dateStr.split(" ");
		const [dd, mm, yyyy] = datePart.split("/");
		if (!dd || !mm || !yyyy) return "";
		const isoStr = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}T${timePart?.slice(0, 5) || "00:00"}`;
		dateObj = new Date(isoStr);
	} else {
		dateObj = new Date(dateStr);
	}
	if (isNaN(dateObj)) return "";
	return dateObj.toISOString().slice(0, 16);
}

export default function InvoiceForm({ open, onClose, onSuccess, editInvoice }) {
	const { user } = useAuth();
	const getClientById = (id) => clients.find((c) => c.per_id === id) || null;
	const getPatientById = (id) => patients.find((p) => p.pat_id === id) || null;
	const [clients, setClients] = useState([]);
	const [patients, setPatients] = useState([]);

	const {
		handleSubmit,
		control,
		reset,
		setValue,
		formState: { errors },
	} = useForm({
		defaultValues: {
			inv_date: "",
			inv_client_id: null,
			inv_patient_id: null,
			inv_subtotal: 0,
			inv_discount: 0,
			inv_tax: 0,
		},
	});

	useEffect(() => {
		const fetchData = async () => {
			const token = Cookies.get("token");
			try {
				const [resClients, resPatients] = await Promise.all([
					axios.get(`${API_BASE}/admin/persons/list`, {
						headers: { tokenapp: token },
					}),
					axios.get(`${API_BASE}/clinic/patients/list`, {
						headers: { tokenapp: token },
					}),
				]);

				if (
					resClients?.data?.result &&
					Array.isArray(resClients.data.data.data)
				) {
					setClients(resClients.data.data.data);
				} else {
					setClients([]);
				}

				if (resPatients?.data?.result && Array.isArray(resPatients.data.data)) {
					setPatients(resPatients.data.data);
				} else {
					setPatients([]);
				}
			} catch (err) {
				console.error("Error cargando datos de clientes o pacientes:", err);
				setClients([]);
				setPatients([]);
			}
		};

		fetchData();
	}, []);

	useEffect(() => {
		if (editInvoice && clients.length > 0 && patients.length > 0) {
			setValue("inv_client_id", getClientById(editInvoice.inv_client_id));
			setValue("inv_patient_id", getPatientById(editInvoice.inv_patient_id));

			const formattedDate = formatDateToDatetimeLocal(editInvoice.date_invoice);
			setValue("inv_date", formattedDate);

			const clientSelected =
				clients.find((c) => c.per_id === editInvoice.inv_client_id) || null;
			setValue("inv_client_id", clientSelected);

			const patientSelected =
				patients.find((p) => p.pat_id === editInvoice.inv_patient_id) || null;
			setValue("inv_patient_id", patientSelected);

			setValue("inv_subtotal", editInvoice.inv_subtotal || 0);
			setValue("inv_discount", editInvoice.inv_discount || 0);
			setValue("inv_tax", editInvoice.inv_tax || 0);
		} else if (!editInvoice) {
			reset();
		}
	}, [editInvoice, clients, patients, setValue, reset]);

	const onSubmit = async (data) => {
		try {
			const payload = {
				...data,
				inv_client_id: data.inv_client_id?.per_id || "",
				inv_patient_id: data.inv_patient_id?.pat_id || "",
				user_created: user.user.user_login_id,
			};

			if (editInvoice) {
				payload.inv_id = editInvoice.inv_id;
				const res = await axios.patch(
					`${API_BASE}/admin/invoice/update`,
					payload,
					{
						headers: { tokenapp: Cookies.get("token") },
					},
				);
				if (res?.data.result) {
					onSuccess();
					onClose();
				}
			} else {
				const res = await axios.post(
					`${API_BASE}/admin/invoice/insert`,
					payload,
					{
						headers: { tokenapp: Cookies.get("token") },
					},
				);
				if (res.data.result) {
					onSuccess();
					onClose();
				}
			}
		} catch (err) {
			console.error("Error en envío de factura:", err);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>
				{editInvoice ? "Editar Factura" : "Registrar Factura"}
			</DialogTitle>
			<DialogContent>
				<form id="invoice-form" onSubmit={handleSubmit(onSubmit)}>
					<Grid container spacing={2} mt={1}>
						<Grid item xs={12} sm={6}>
							<Controller
								name="inv_date"
								control={control}
								rules={{ required: "Fecha requerida" }}
								render={({ field }) => (
									<TextField
										{...field}
										label="Fecha de Factura"
										type="datetime-local"
										InputLabelProps={{ shrink: true }}
										fullWidth
										error={!!errors.inv_date}
										helperText={errors.inv_date?.message}
										required
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Controller
								name="inv_client_id"
								control={control}
								rules={{ required: "Cliente requerido" }}
								render={({ field }) => (
									<Autocomplete
										options={clients}
										getOptionLabel={(option) =>
											`${option.per_identification} - ${option.per_names} ${option.per_surnames}`
										}
										onChange={(_, value) => field.onChange(value)}
										value={field.value || null}
										isOptionEqualToValue={(option, value) =>
											value ? option.per_id === value.per_id : false
										}
										renderInput={(params) => (
											<TextField
												{...params}
												label="Cliente"
												fullWidth
												required
												error={!!errors.inv_client_id}
												helperText={errors.inv_client_id?.message}
											/>
										)}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Controller
								name="inv_patient_id"
								control={control}
								rules={{ required: "Paciente requerido" }}
								render={({ field }) => (
									<Autocomplete
										options={patients}
										getOptionLabel={(option) =>
											`${option.pat_code} - ${option.per_names} ${option.per_surnames}`
										}
										onChange={(_, value) => field.onChange(value)}
										value={field.value || null}
										isOptionEqualToValue={(option, value) =>
											value ? option.pat_id === value.pat_id : false
										}
										renderInput={(params) => (
											<TextField
												{...params}
												label="Paciente"
												fullWidth
												required
												error={!!errors.inv_patient_id}
												helperText={errors.inv_patient_id?.message}
											/>
										)}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Controller
								name="inv_subtotal"
								control={control}
								rules={{ required: "Subtotal requerido" }}
								render={({ field }) => (
									<TextField
										{...field}
										label="Subtotal"
										type="number"
										fullWidth
										required
										error={!!errors.inv_subtotal}
										helperText={errors.inv_subtotal?.message}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Controller
								name="inv_discount"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Descuento"
										type="number"
										fullWidth
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Controller
								name="inv_tax"
								control={control}
								render={({ field }) => (
									<TextField {...field} label="IVA" type="number" fullWidth />
								)}
							/>
						</Grid>
					</Grid>
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancelar</Button>
				<Button type="submit" form="invoice-form" variant="contained">
					{editInvoice ? "Actualizar" : "Registrar"}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
