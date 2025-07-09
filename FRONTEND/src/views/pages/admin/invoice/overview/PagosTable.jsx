import React, { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	IconButton,
	Collapse,
	Typography,
	Box,
	Button,
	Chip,
	Avatar,
	Tooltip,
} from "@mui/material";
import {
	KeyboardArrowDown,
	KeyboardArrowUp,
	PhotoCamera,
	InfoOutlined,
} from "@mui/icons-material";

export default function PagosTable({ pagos, onVerImagen, onVerDetalle }) {
	
	const mostrar = (valor) =>
		valor === null || valor === undefined || valor === "" ? "No indica" : valor;

	return (
		<Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
			<Typography variant="h6" gutterBottom>
				Listado de Pagos
			</Typography>

			{!pagos?.length ? (
				<Typography variant="body2" color="text.secondary">
					No hay pagos registrados.
				</Typography>
			) : (
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Método</TableCell>
								<TableCell>Referencia</TableCell>
								<TableCell>Monto</TableCell>
								<TableCell>Estado</TableCell>
								<TableCell>Fecha</TableCell>
								<TableCell>Comprobante</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{pagos.map((pago) => (
								<React.Fragment key={pago.inp_id}>
									<TableRow hover>
										<TableCell>
											<Chip
												label={mostrar(pago.pme_name)}
												variant="outlined"
												color="primary"
												size="small"
											/>
										</TableCell>
										<TableCell>{mostrar(pago.inp_reference)}</TableCell>
										<TableCell>
											<strong>${parseFloat(pago.inp_amount).toFixed(2)}</strong>
										</TableCell>
										<TableCell>
											<Chip
												label={pago.inp_state ? "Activo" : "Inactivo"}
												color={pago.inp_state ? "success" : "error"}
												size="small"
											/>
										</TableCell>
										<TableCell>{mostrar(pago.date_created)}</TableCell>
										<TableCell>
											{pago.inp_proof_image_path ? (
												<Tooltip title="Ver imagen del comprobante">
													<Button
														variant="outlined"
														size="small"
														startIcon={<PhotoCamera />}
														onClick={() =>
															onVerImagen(pago.inp_proof_image_path)
														}
													>
														Ver
													</Button>
												</Tooltip>
											) : (
												<Typography variant="body2" color="text.secondary">
													No indica
												</Typography>
											)}
										</TableCell>
									</TableRow>
								</React.Fragment>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			)}
		</Paper>
	);
}
