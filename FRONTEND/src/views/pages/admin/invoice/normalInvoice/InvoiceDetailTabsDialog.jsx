import React, { useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Tabs,
	Tab,
	Box,
	Typography,
} from "@mui/material";
import InvoiceDetailForm from "./InvoiceDetailForm";
import InvoiceTaxForm from "./InvoiceTaxForm";
import InvoicePaymentForm from "./InvoicePaymentForm";

export default function InvoiceDetailTabsDialog({ open, onClose, invoice }) {
	const [tabIndex, setTabIndex] = useState(0);

	const handleTabChange = (_, newValue) => {
		setTabIndex(newValue);
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
			<DialogTitle>Gestión de Factura #{invoice.inv_number}</DialogTitle>
			<DialogContent>
				<Tabs value={tabIndex} onChange={handleTabChange}>
					<Tab label="Detalles" />
					<Tab label="Impuestos" />
					<Tab label="Pagos" />
				</Tabs>

				<Box mt={2}>
					{tabIndex === 0 && <InvoiceDetailForm invoiceId={invoice.inv_id} />}
					{tabIndex === 1 && <InvoiceTaxForm invoiceId={invoice.inv_id} />}
					{tabIndex === 2 && <InvoicePaymentForm invoiceId={invoice.inv_id} />}
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cerrar</Button>
			</DialogActions>
		</Dialog>
	);
}
