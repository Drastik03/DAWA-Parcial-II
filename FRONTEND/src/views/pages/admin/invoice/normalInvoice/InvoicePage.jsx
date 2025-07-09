import React, { useEffect, useState } from "react";
import {
	Typography,
	Box,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	IconButton,
	Snackbar,
	Alert,
} from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import InvoiceForm from "./InvoiceForm";
import InvoiceDetailTabsDialog from "./InvoiceDetailTabsDialog";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

export default function InvoicePage() {
	const [invoices, setInvoices] = useState([]);
	const [openForm, setOpenForm] = useState(false);
	const [selectedInvoice, setSelectedInvoice] = useState(null);
	const [openDetailDialog, setOpenDetailDialog] = useState(false);
	const [editInvoice, setEditInvoice] = useState(null);
	const navigate = useNavigate();
	const [alert, setAlert] = useState({
		open: false,
		message: "",
		severity: "success",
	});

	const fetchInvoices = async () => {
		try {
			const res = await axios.get(`${API_BASE}/admin/invoice/list`, {
				headers: { tokenapp: Cookies.get("token") },
			});
			setInvoices(Array.isArray(res.data.data) ? res.data.data : []);
		} catch (err) {
			console.error(err);
			setAlert({
				open: true,
				message: "Error cargando facturas",
				severity: "error",
			});
		}
	};

	useEffect(() => {
		fetchInvoices();
	}, []);

	const handleDelete = async (id) => {
		if (!window.confirm("¿Desea eliminar esta factura?")) return;
		try {
			const res = await axios.delete(`${API_BASE}/admin/invoice/delete/${id}`, {
				headers: { tokenapp: Cookies.get("token") },
			});
			if (res.data.result) {
				setAlert({
					open: true,
					message: res.data.message,
					severity: "success",
				});
				fetchInvoices();
			} else {
				setAlert({ open: true, message: res.data.message, severity: "error" });
			}
		} catch (err) {
			console.error(err);
			setAlert({
				open: true,
				message: "Error eliminando factura",
				severity: "error",
			});
		}
	};

	return (
		<Box p={2}>
			<Typography variant="h4" gutterBottom>
				Facturas
			</Typography>
			<Button variant="contained" onClick={() => setOpenForm(true)}>
				Nueva Factura
			</Button>

			<TableContainer component={Paper} sx={{ mt: 2 }}>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>#</TableCell>
							<TableCell>Cliente</TableCell>
							<TableCell>Subtotal</TableCell>
							<TableCell>Descuento</TableCell>
							<TableCell>IVA</TableCell>
							<TableCell>Total</TableCell>
							<TableCell>Fecha</TableCell>
							<TableCell>Acciones</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{invoices.length === 0 ? (
							<TableRow>
								<TableCell colSpan={8} align="center">
									No hay facturas
								</TableCell>
							</TableRow>
						) : (
							invoices.map((inv) => (
								<TableRow key={inv.inv_id}>
									<TableCell>{inv.inv_number}</TableCell>
									<TableCell>{inv.full_name}</TableCell>
									<TableCell>{inv.inv_subtotal}</TableCell>
									<TableCell>{inv.inv_discount}</TableCell>
									<TableCell>{inv.inv_tax}</TableCell>
									<TableCell>{inv.inv_grand_total}</TableCell>
									<TableCell>{inv.date_invoice}</TableCell>
									<TableCell>
										<IconButton
											onClick={() => {
												setEditInvoice(inv);
												setOpenForm(true);
											}}
										>
											<Edit fontSize="small" />
										</IconButton>
										<IconButton
											color="error"
											onClick={() => handleDelete(inv.inv_id)}
										>
											<Delete fontSize="small" />
										</IconButton>
										<Button
											onClick={() => {
												setSelectedInvoice(inv);
												setOpenDetailDialog(true);
											}}
										>
											Agregar detalles
										</Button>
										<Button
											onClick={() =>
												navigate(`/invoice/${inv.inv_id}/details/view`)
											}
											variant="outlined"
											color="primary"
										>
											Ver detalles
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>
			{selectedInvoice && (
				<InvoiceDetailTabsDialog
					open={openDetailDialog}
					onClose={() => {
						setOpenDetailDialog(false);
						setSelectedInvoice(null);
					}}
					invoice={selectedInvoice}
				/>
			)}

			<InvoiceForm
				open={openForm}
				onClose={() => {
					setOpenForm(false);
					setEditInvoice(null);
				}}
				onSuccess={fetchInvoices}
				editInvoice={editInvoice}
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
