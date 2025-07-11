import React, { useState, useEffect } from "react";
import {
	Box,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Typography,
	IconButton,
	Snackbar,
	Alert,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import TaxForm from "./TaxForm";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

const API_BASE = import.meta.env.VITE_API_URL; 


export default function TaxPage() {
	const [taxes, setTaxes] = useState([]);
	const [alert, setAlert] = useState({
		open: false,
		message: "",
		severity: "success",
	});
	const [openForm, setOpenForm] = useState(false);
	const [editTax, setEditTax] = useState(null);
	const [deleteId, setDeleteId] = useState(null);

	const fetchTaxes = async () => {
		try {
			const res = await axios.get(`${API_BASE}/admin/tax/list`, {
				headers: { tokenapp: Cookies.get("token") },
			});
			setTaxes(Array.isArray(res.data.data) ? res.data.data : []);
		} catch (err) {
			console.error(err);
			setAlert({
				open: true,
				message: "Error cargando impuestos",
				severity: "error",
			});
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		fetchTaxes();
	}, []);

	const handleDelete = async () => {
		try {
			const res = await axios.delete(
				`${API_BASE}/admin/tax/delete/${deleteId}`,
				{
					headers: { tokenapp: Cookies.get("token") },
				},
			);
			setAlert({
				open: true,
				message: res.data.message,
				severity: res.data.result ? "success" : "error",
			});
			setDeleteId(null);
			fetchTaxes();
		} catch (err) {
			console.error(err);
			setAlert({
				open: true,
				message: "Error al eliminar impuesto",
				severity: "error",
			});
		}
	};

	return (
		<Box p={2}>
			<Typography variant="h4" gutterBottom>
				Clases de Impuestos
			</Typography>

			<Button variant="contained" onClick={() => setOpenForm(true)}>
				Nuevo Impuesto
			</Button>

			<TableContainer component={Paper} sx={{ mt: 2 }}>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>Nombre</TableCell>
							<TableCell>Porcentaje (%)</TableCell>
							<TableCell>Descripción</TableCell>
							<TableCell>Acciones</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{taxes.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} align="center">
									No hay impuestos registrados
								</TableCell>
							</TableRow>
						) : (
							taxes.map((tax) => (
								<TableRow key={tax.tax_id}>
									<TableCell>{tax.tax_name}</TableCell>
									<TableCell>{tax.tax_percentage}</TableCell>
									<TableCell>{tax.tax_description}</TableCell>
									<TableCell>
										<IconButton
											onClick={() => {
												setEditTax(tax);
												setOpenForm(true);
											}}
										>
											<Edit fontSize="small" />
										</IconButton>
										<IconButton
											color="error"
											onClick={() => setDeleteId(tax.tax_id)}
										>
											<Delete fontSize="small" />
										</IconButton>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<TaxForm
				open={openForm}
				onClose={() => {
					setOpenForm(false);
					setEditTax(null);
				}}
				onSuccess={fetchTaxes}
				editTax={editTax}
			/>

			<ConfirmDeleteDialog
				open={Boolean(deleteId)}
				onClose={() => setDeleteId(null)}
				onConfirm={handleDelete}
				title="Eliminar Impuesto"
				message="¿Está seguro de que desea eliminar este impuesto?"
			/>

			<Snackbar
				open={alert.open}
				autoHideDuration={3000}
				onClose={() => setAlert({ ...alert, open: false })}
			>
				<Alert severity={alert.severity}>{alert.message}</Alert>
			</Snackbar>
		</Box>
	);
}
