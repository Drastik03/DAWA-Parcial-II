// src/pages/invoice/InvoiceDetailForm.jsx
import React, { useEffect, useState } from "react";
import { TextField, Grid, Button, Autocomplete } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "../../../../../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL;

export default function InvoiceDetailForm({ invoiceId }) {
	const [products, setProducts] = useState([]);
	const { user } = useAuth();
	const { control, handleSubmit, reset, setValue } = useForm({
		defaultValues: {
			ind_product_id: null,
			ind_quantity: 1,
			ind_unit_price: 0,
		},
	});

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const res = await axios.get(`${API_BASE}/admin/product/list`, {
					headers: { tokenapp: Cookies.get("token") },
				});
				console.log(res?.data?.data);

				if (res.data?.result && Array.isArray(res.data?.data.data)) {
					setProducts(res.data?.data.data);
				} else {
					setProducts([]);
				}
			} catch (err) {
				console.error("Error cargando productos:", err);
				setProducts([]);
			}
		};

		fetchProducts();
	}, []);

	const onSubmit = async (data) => {
		const payload = {
			ind_invoice_id: invoiceId,
			ind_product_id: data.ind_product_id?.pro_id || "",
			ind_quantity: Number(data.ind_quantity),
			ind_unit_price: data.ind_unit_price,
			ind_total: data.ind_quantity * data.ind_unit_price,
			user_created: user.user.user_login_id,
		};

		try {
			const res = await axios.post(
				`${API_BASE}/admin/invoicedetail/insert`,
				payload,
				{
					headers: { tokenapp: Cookies.get("token") },
				},
			);
			if (res.data.result) {
				reset();
			}
		} catch (err) {
			console.error("Error registrando detalle:", err);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={6}>
					<Controller
						name="ind_product_id"
						control={control}
						rules={{ required: "Producto requerido" }}
						render={({ field, fieldState }) => (
							<Autocomplete
								options={products}
								getOptionLabel={(option) =>
									`${option.pro_code} - ${option.pro_name}`
								}
								value={field.value || null}
								onChange={(_, value) => {
									field.onChange(value);
									setValue("ind_unit_price", value?.pro_price || 0);
								}}
								isOptionEqualToValue={(option, value) =>
									option.pro_id === value?.pro_id
								}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Producto"
										fullWidth
										error={!!fieldState.error}
										helperText={fieldState.error?.message}
										required
									/>
								)}
							/>
						)}
					/>
				</Grid>

				<Grid item xs={12} sm={3}>
					<Controller
						name="ind_quantity"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label="Cantidad"
								type="number"
								fullWidth
								required
							/>
						)}
					/>
				</Grid>

				<Grid item xs={12} sm={3}>
					<Controller
						name="ind_unit_price"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label="Precio Unitario"
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
				Registrar Detalle
			</Button>
		</form>
	);
}
