import React, { useEffect, useState } from "react";
import {
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	IconButton,
	TextField,
	Button,
	Box,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE = "http://localhost:5000";

export default function InvoiceTaxesTab({ invoice }) {
	const [taxes, setTaxes] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!invoice) return;
		const fetchTaxes = async () => {
			try {
				const res = await axios.get(
					`${API_BASE}/admin/invoice/taxes/${invoice.inv_id}`,
					{
						headers: { tokenapp: Cookies.get("token") },
					},
				);
				setTaxes(res.data.data || []);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		fetchTaxes();
	}, [invoice]);

	const handleAdd = () => {
		setTaxes((prev) => [
			...prev,
			{ id: `new-${Date.now()}`, tax_name: "", tax_percentage: 0 },
		]);
	};

	const handleChange = (id, field, value) => {
		setTaxes((prev) =>
			prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
		);
	};

	const handleDelete = (id) => {
		setTaxes((prev) => prev.filter((t) => t.id !== id));
	};

	const handleSave = async () => {
		try {
			await axios.post(
				`${API_BASE}/admin/invoice/taxes/save/${invoice.inv_id}`,
				taxes,
				{
					headers: { tokenapp: Cookies.get("token") },
				},
			);
			alert("Impuestos guardados");
		} catch (err) {
			console.error(err);
			alert("Error guardando impuestos");
		}
	};

	if (loading) return <div>Cargando impuestos...</div>;

	return (
		<Box>
			<Button startIcon={<Add />} onClick={handleAdd} sx={{ mb: 1 }}>
				Agregar Impuesto
			</Button>
			<Table size="small" stickyHeader>
				<TableHead>
					<TableRow>
						<TableCell>Nombre</TableCell>
						<TableCell>Porcentaje</TableCell>
						<TableCell>Acciones</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{taxes.map((tax) => (
						<TableRow key={tax.id}>
							<TableCell>
								<TextField
									value={tax.tax_name}
									onChange={(e) =>
										handleChange(tax.id, "tax_name", e.target.value)
									}
									fullWidth
								/>
							</TableCell>
							<TableCell>
								<TextField
									type="number"
									value={tax.tax_percentage}
									onChange={(e) =>
										handleChange(
											tax.id,
											"tax_percentage",
											Number(e.target.value),
										)
									}
									inputProps={{ min: 0, max: 100, step: 0.01 }}
								/>
							</TableCell>
							<TableCell>
								<IconButton color="error" onClick={() => handleDelete(tax.id)}>
									<Delete />
								</IconButton>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<Button variant="contained" sx={{ mt: 2 }} onClick={handleSave}>
				Guardar Impuestos
			</Button>
		</Box>
	);
}
