import React from "react";
import {
	Paper,
	Typography,
	Divider,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	useTheme,
	Box,
} from "@mui/material";

function mostrarValor(value) {
	if (value === null || value === undefined || String(value).trim() === "") {
		return "No indica";
	}
	return String(value);
}

export default function TaxTable({ taxes }) {
	const theme = useTheme();

	if (!taxes || taxes.length === 0) {
		return (
			<Paper
				sx={{
					p: 3,
					borderRadius: 3,
					backgroundColor: theme.palette.background.default,
					boxShadow: 2,
				}}
			>
				<Typography variant="h6" gutterBottom>
					Impuestos
				</Typography>
				<Divider sx={{ mb: 2 }} />
				<Typography variant="body2" color="text.secondary">
					No hay impuestos disponibles.
				</Typography>
			</Paper>
		);
	}

	return (
		<Paper
			sx={{
				p: 3,
				borderRadius: 3,
				backgroundColor: theme.palette.background.paper,
				boxShadow: 3,
			}}
		>
			<Typography variant="h6" gutterBottom>
				Impuestos
			</Typography>
			<Divider sx={{ mb: 2 }} />

			<Box sx={{ overflowX: "auto" }}>
				<TableContainer>
					<Table stickyHeader size="small">
						<TableHead>
							<TableRow>
								<TableCell
									sx={{
										backgroundColor: theme.palette.grey[100],
										fontWeight: 600,
										textTransform: "capitalize",
										fontSize: 13,
										color: theme.palette.text.primary,
										borderBottom: `2px solid ${theme.palette.divider}`,
										whiteSpace: "nowrap",
									}}
								>
									Tipo
								</TableCell>
								<TableCell
									sx={{
										backgroundColor: theme.palette.grey[100],
										fontWeight: 600,
										textTransform: "capitalize",
										fontSize: 13,
										color: theme.palette.text.primary,
										borderBottom: `2px solid ${theme.palette.divider}`,
										whiteSpace: "nowrap",
									}}
								>
									Porcentaje
								</TableCell>
								<TableCell
									sx={{
										backgroundColor: theme.palette.grey[100],
										fontWeight: 600,
										textTransform: "capitalize",
										fontSize: 13,
										color: theme.palette.text.primary,
										borderBottom: `2px solid ${theme.palette.divider}`,
										whiteSpace: "nowrap",
									}}
								>
									Monto
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{taxes.map((tax, i) => (
								<TableRow
									key={tax.id || i}
									hover
									sx={{
										transition: "background-color 0.2s ease-in-out",
									}}
								>
									<TableCell
										sx={{
											fontSize: 13,
											color: theme.palette.text.secondary,
											whiteSpace: "nowrap",
										}}
									>
										{mostrarValor(
											tax.tax_type || tax.type || tax.nombre || tax.descripcion,
										)}
									</TableCell>
									<TableCell
										sx={{
											fontSize: 13,
											color: theme.palette.text.secondary,
											whiteSpace: "nowrap",
										}}
									>
										{mostrarValor(
											tax.tax_percent != null
												? `${parseFloat(tax.tax_percent).toFixed(2)}%`
												: tax.porcentaje != null
													? `${parseFloat(tax.porcentaje).toFixed(2)}%`
													: "No indica",
										)}
									</TableCell>
									<TableCell
										sx={{
											fontSize: 13,
											color: theme.palette.text.secondary,
											whiteSpace: "nowrap",
										}}
									>
										{tax.amount != null
											? `$${parseFloat(tax.amount).toFixed(2)}`
											: tax.monto != null
												? `$${parseFloat(tax.monto).toFixed(2)}`
												: "No indica"}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</Box>
		</Paper>
	);
}
