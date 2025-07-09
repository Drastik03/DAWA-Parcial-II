import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import Cookies from "js-cookie";
import axios from "axios";
import {
	Alert,
	Button,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	DialogActions,
	Typography,
	Grid,
	Box,
	useTheme,
} from "@mui/material";

import DataTableSimple from "./DataTableSimple";
import PagosTable from "./PagosTable";
import InvoiceDetailTable from "./InvoiceDetailTable";
import TaxTable from "./TaxTable";

const API_BASE = "http://localhost:5000";

function extractDataArray(response) {
	if (!response || !response.data) return [];
	if (Array.isArray(response.data)) return response.data;
	if (Array.isArray(response.data.data)) return response.data.data;
	if (Array.isArray(response.data.data?.data)) return response.data.data.data;
	return [];
}

export default function InvoiceDataOverview() {
	const { id } = useParams();
	const theme = useTheme();

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [taxes, setTaxes] = useState([]);
	const [details, setDetails] = useState([]);
	const [payments, setPayments] = useState([]);

	const [openImageModal, setOpenImageModal] = useState(false);
	const [selectedImageUrl, setSelectedImageUrl] = useState("");

	const [openPagoDetalleModal, setOpenPagoDetalleModal] = useState(false);
	const [detallePagoSeleccionado, setDetallePagoSeleccionado] = useState(null);

	const token = Cookies.get("token");

	const fetchDetails = async () => {
		if (!token) return [];
		try {
			const res = await axios.get(
				`${API_BASE}/admin/invoicedetail/invoice/${id}`,
				{
					headers: { tokenapp: token },
				},
			);
			console.log("Details response:", res);
			return extractDataArray(res);
		} catch (err) {
			if (
				err.response?.status === 404 ||
				String(err.response?.data?.message || "").includes("PRO FEATURE")
			) {
				return [{ Mensaje: "PRO Feature Only" }];
			}
			throw err;
		}
	};

	const fetchTaxes = async () => {
		if (!token) return [];
		try {
			const res = await axios.get(
				`${API_BASE}/admin/invoice_tax/by_invoice/${id}`,
				{
					headers: { tokenapp: token },
				},
			);
			console.log("Taxes response:", res.data.data);
			return extractDataArray(res);
		} catch (err) {
			if (
				err.response?.status === 404 ||
				String(err.response?.data?.message || "").includes("PRO FEATURE")
			) {
				return [{ Mensaje: "PRO Feature Only" }];
			}
			throw err;
		}
	};

	const fetchPayments = async () => {
		if (!token) return [];
		try {
			const res = await axios.get(
				`${API_BASE}/admin/invoicepayment/by_invoice/${id}`,
				{
					headers: { tokenapp: token },
				},
			);
			console.log("Payments response:", res.data.data);
			return extractDataArray(res);
		} catch (err) {
			if (
				err.response?.status === 404 ||
				String(err.response?.data?.message || "").includes("PRO FEATURE")
			) {
				return [{ Mensaje: "PRO Feature Only" }];
			}
			throw err;
		}
	};

	useEffect(() => {
		if (!id || !token) return;

		setLoading(true);
		setError("");

		Promise.all([fetchDetails(), fetchTaxes(), fetchPayments()])
			.then(([det, tax, pay]) => {
				setDetails(det);
				setTaxes(tax);
				setPayments(pay);
			})
			.catch(() => {
				setError("Error al cargar los datos de la factura");
				setDetails([]);
				setTaxes([]);
				setPayments([]);
			})
			.finally(() => setLoading(false));
	}, [id, token]);

	const abrirModalImagen = (url) => {
		setSelectedImageUrl(url);
		setOpenImageModal(true);
	};

	const abrirDetallePago = (pago) => {
		setDetallePagoSeleccionado(pago);
		setOpenPagoDetalleModal(true);
	};

	return loading ? (
		<Box display="flex" justifyContent="center" mt={4}>
			<CircularProgress />
		</Box>
	) : error ? (
		<Alert severity="error" sx={{ mt: 2 }}>
			{error}
		</Alert>
	) : (
		<>
			<Typography variant="h4" gutterBottom textAlign="center">
				Factura #{id}
			</Typography>
			<Grid container direction="column" spacing={4}>
				<Grid item>
					<TaxTable rows={taxes} />
				</Grid>
				<Grid item>
					<InvoiceDetailTable rows={details} />
				</Grid>
				<Grid item>
					<PagosTable
						pagos={payments}
						onVerImagen={abrirModalImagen}
						onVerDetalle={abrirDetallePago}
					/>
				</Grid>
			</Grid>

			<Dialog
				open={openImageModal}
				onClose={() => setOpenImageModal(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Imagen del Pago</DialogTitle>
				<DialogContent dividers sx={{ textAlign: "center", p: 3 }}>
					{selectedImageUrl ? (
						<img
							src={selectedImageUrl}
							alt="Imagen del pago"
							style={{ maxWidth: "100%", maxHeight: 400, borderRadius: 8 }}
						/>
					) : (
						<Typography color="text.secondary">No indica</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenImageModal(false)} variant="contained">
						Cerrar
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={openPagoDetalleModal}
				onClose={() => setOpenPagoDetalleModal(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Detalle del Pago</DialogTitle>
				<DialogContent dividers sx={{ p: 3 }}>
					{detallePagoSeleccionado ? (
						<Box
							component="pre"
							sx={{
								whiteSpace: "pre-wrap",
								fontSize: 14,
								fontFamily: "monospace",
							}}
						>
							{JSON.stringify(detallePagoSeleccionado, null, 2)}
						</Box>
					) : (
						<Typography color="text.secondary">
							No hay detalles disponibles.
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => setOpenPagoDetalleModal(false)}
						variant="contained"
					>
						Cerrar
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
