import React, { useEffect, useState } from "react";
import { TextField, Grid, Button, Autocomplete } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "../../../../../context/AuthContext";

const API_BASE = "http://localhost:5000";

export default function InvoiceTaxForm({ invoiceId }) {
	const [taxes, setTaxes] = useState([]);
	const { user } = useAuth();

	const { control, handleSubmit, reset, setValue } = useForm({
		defaultValues: {
			int_tax_id: null,
			int_tax_amount: 0,
		},
	});

	useEffect(() => {
		const fetchTaxes = async () => {
			try {
				const res = await axios.get(`${API_BASE}/admin/tax/list`, {
					headers: { tokenapp: Cookies.get("token") },
				});
				if (res.data?.result && Array.isArray(res.data.data)) {
					setTaxes(res.data.data);
				} else {
					setTaxes([]);
				}
			} catch (err) {
				console.error("Error cargando impuestos:", err);
				setTaxes([]);
			}
		};

		fetchTaxes();
	}, []);

	const onSubmit = async (data) => {
		const payload = {
			int_invoice_id: invoiceId,
			int_tax_id: data.int_tax_id?.tax_id || "",
			int_tax_amount: data.int_tax_amount,
			user_created: user.user.user_login_id,
		};

		try {
			const res = await axios.post(
				`${API_BASE}/admin/invoice_tax/insert`,
				payload,
				{
					headers: { tokenapp: Cookies.get("token") },
				},
			);
			if (res.data.result) {
				reset();
				console.log("Impuesto registrado correctamente");
			}
		} catch (err) {
			console.error("Error registrando impuesto:", err);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={6}>
					<Controller
						name="int_tax_id"
						control={control}
						rules={{ required: "Impuesto requerido" }}
						render={({ field, fieldState }) => (
							<Autocomplete
								options={taxes}
								getOptionLabel={(option) =>
									`${option.tax_name} - ${option.tax_percentage}%`
								}
								value={field.value || null}
								onChange={(_, value) => {
									field.onChange(value);
									setValue("int_tax_amount", value?.tax_percentage || 0);
								}}
								isOptionEqualToValue={(option, value) =>
									option.tax_id === value?.tax_id
								}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Impuesto"
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

				<Grid item xs={12} sm={6}>
					<Controller
						name="int_tax_amount"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label="Monto del Impuesto"
								type="number"
								fullWidth
								required
								InputProps={{ readOnly: true }}
							/>
						)}
					/>
				</Grid>
			</Grid>

			<Button type="submit" variant="contained" sx={{ mt: 2 }}>
				Registrar Impuesto
			</Button>
		</form>
	);
}
