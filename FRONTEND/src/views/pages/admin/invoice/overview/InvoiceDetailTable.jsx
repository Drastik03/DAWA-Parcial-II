import React from "react";
import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	Chip,
	Box,
} from "@mui/material";
export default function InvoiceDetailTable({ rows }) {
	console.log("Detalles recibidos en tabla:", rows);

	const mostrar = (val) =>
		val === null || val === undefined ? "No indica" : val;

	return (
		<Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
			<Typography variant="h6" gutterBottom>
				Detalle de Factura
			</Typography>

			{!rows?.length ? (
				<Typography variant="body2" color="text.secondary">
					No hay detalles disponibles.
				</Typography>
			) : (
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Código</TableCell>
								<TableCell>Producto</TableCell>
								<TableCell align="right">Precio Unitario</TableCell>
								<TableCell align="right">Cantidad</TableCell>
								<TableCell align="right">Total</TableCell>
								<TableCell>Estado</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{rows.map((row) => (
								<TableRow key={row.ind_id}>
									<TableCell>{mostrar(row.pro_code)}</TableCell>
									<TableCell>{mostrar(row.pro_name)}</TableCell>
									<TableCell align="right">
										${row.ind_unit_price?.toFixed(2)}
									</TableCell>
									<TableCell align="right">{row.ind_quantity}</TableCell>
									<TableCell align="right">
										${row.ind_total?.toFixed(2)}
									</TableCell>
									<TableCell>
										<Chip
											label={row.ind_state ? "Activo" : "Inactivo"}
											color={row.ind_state ? "success" : "error"}
											size="small"
										/>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			)}
		</Paper>
	);
}
  