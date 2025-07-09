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

export default function DataTableSimple({ title, rows }) {
	const theme = useTheme();

	if (!rows || rows.length === 0) {
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
					{title}
				</Typography>
				<Divider sx={{ mb: 2 }} />
				<Typography variant="body2" color="text.secondary">
					No hay datos disponibles.
				</Typography>
			</Paper>
		);
	}

	const columnas = Object.keys(rows[0]).filter(
		(col) => !col.toLowerCase().includes("id"),
	);

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
				{title}
			</Typography>
			<Divider sx={{ mb: 2 }} />

			<Box sx={{ overflowX: "auto" }}>
				<TableContainer>
					<Table stickyHeader size="small">
						<TableHead>
							<TableRow>
								{columnas.map((col) => (
									<TableCell
										key={col}
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
										{col.replace(/_/g, " ")}
									</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{rows.map((row, i) => (
								<TableRow
									key={i}
									hover
									sx={{
										transition: "background-color 0.2s ease-in-out",
									}}
								>
									{columnas.map((col) => (
										<TableCell
											key={col}
											sx={{
												fontSize: 13,
												color: theme.palette.text.secondary,
												whiteSpace: "nowrap",
											}}
										>
											{mostrarValor(row[col])}
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</Box>
		</Paper>
	);
}
