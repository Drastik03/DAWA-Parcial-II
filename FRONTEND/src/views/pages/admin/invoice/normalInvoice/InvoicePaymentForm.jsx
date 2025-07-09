import React, { useEffect, useState } from "react";
import { TextField, Grid, Button, Autocomplete } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "../../../../../context/AuthContext";

const API_BASE = "http://localhost:5000";

export default function InvoicePaymentForm({ invoiceId }) {
	const { user } = useAuth();
	const [methods, setMethods] = useState([]);
	const [imageFile, setImageFile] = useState(null); 

	const { control, handleSubmit, reset, watch } = useForm({
		defaultValues: {
			inp_payment_method_id: null,
			inp_amount: 0,
			inp_reference: "",
		},
	});

	const selectedMethod = watch("inp_payment_method_id");

	useEffect(() => {
		const fetchMethods = async () => {
			try {
				const res = await axios.get(`${API_BASE}/admin/payment_method/list`, {
					headers: { tokenapp: Cookies.get("token") },
				});
				const items = res?.data?.data?.data.data;
				if (Array.isArray(items)) {
					setMethods(items);
				} else {
					setMethods([]);
				}
			} catch (err) {
				console.error("Error cargando métodos de pago:", err);
			}
		};

		fetchMethods();
	}, []);

	const onSubmit = async (data) => {
		try {
			const formData = new FormData();
			formData.append("inp_invoice_id", invoiceId);
			formData.append(
				"inp_payment_method_id",
				data.inp_payment_method_id?.pme_id || "",
			);
			formData.append("inp_amount", data.inp_amount);
			formData.append("user_created", user.user.user_login_id);

			if (imageFile) {
				formData.append("file", imageFile); 
			}

			const res = await axios.post(
				`${API_BASE}/admin/invoicepayment/insert`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
						tokenapp: Cookies.get("token"),
					},
				},
			);

			if (res.data.result) {
				reset();
				setImageFile(null); 
				console.log("Pago registrado correctamente");
			}
		} catch (err) {
			console.error("Error registrando pago:", err);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={4}>
					<Controller
						name="inp_payment_method_id"
						control={control}
						rules={{ required: "Método requerido" }}
						render={({ field, fieldState }) => (
							<Autocomplete
								options={methods}
								getOptionLabel={(option) => option.pme_name}
								value={field.value || null}
								onChange={(_, value) => field.onChange(value)}
								isOptionEqualToValue={(option, value) =>
									option.pme_id === value?.pme_id
								}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Método de Pago"
										fullWidth
										required
										error={!!fieldState.error}
										helperText={fieldState.error?.message}
									/>
								)}
							/>
						)}
					/>
				</Grid>

				<Grid item xs={12} sm={4}>
					<Controller
						name="inp_amount"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label="Monto"
								type="number"
								fullWidth
								required
							/>
						)}
					/>
				</Grid>

				{selectedMethod?.pme_require_references && (
					<Grid item xs={12} sm={4}>
						<Controller
							name="inp_reference"
							control={control}
							rules={{ required: "Referencia requerida" }}
							render={({ field, fieldState }) => (
								<TextField
									{...field}
									label="Referencia"
									fullWidth
									required
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
								/>
							)}
						/>
					</Grid>
				)}

				{selectedMethod?.pme_require_picture_proff && (
					<Grid item xs={12} sm={6}>
						{/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
						<label style={{ display: "block", marginBottom: "0.5rem" }}>
							Subir comprobante:
						</label>
						<input
							type="file"
							accept="image/*"
							onChange={(e) => setImageFile(e.target.files[0])}
							style={{ display: "block" }}
							required
						/>
					</Grid>
				)}
			</Grid>

			<Button type="submit" variant="contained" sx={{ mt: 2 }}>
				Registrar Pago
			</Button>
		</form>
	);
}
