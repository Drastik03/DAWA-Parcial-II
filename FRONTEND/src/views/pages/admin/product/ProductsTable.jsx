import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
	Typography,
	Box,
	Avatar,
	Chip,
	Paper,
	Collapse,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Button,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import { Stack } from "@mui/system";
import { useFetch } from "../../../../hooks/useFetch";
import PageContainer from "../../../../components/container/PageContainer";
import ParentCard from "../../../../components/shared/ParentCard";
import Breadcrumb from "../../../../layouts/full/shared/breadcrumb/Breadcrumb";
import { DeleteOutline, EditOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router";

function Row({ row }) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
				<TableCell>
					<IconButton
						aria-label="expand row"
						size="small"
						onClick={() => setOpen(!open)}
					>
						{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
					</IconButton>
				</TableCell>
				<TableCell>
					<Stack direction="row" spacing={2} alignItems="center">
						<Avatar
							src={row.pro_image_url}
							alt={row.pro_name}
							sx={{ width: 90, height: 70, borderRadius: "10px" }}
						/>
						<Typography variant="h6" fontWeight="600">
							{row.pro_name}
						</Typography>
					</Stack>
				</TableCell>
				<TableCell>
					<Typography color="textSecondary" variant="h6">
						{row.user_created}
					</Typography>
				</TableCell>
				<TableCell>
					<Chip
						size="small"
						label={row.pro_state ? "Activo" : "Inactivo"}
						color={row.pro_state ? "primary" : "error"}
						sx={{ borderRadius: "6px" }}
					/>
				</TableCell>
				<TableCell>
					<Typography color="textSecondary" variant="h6" fontWeight="400">
						${row.pro_price.toFixed(2)}
					</Typography>
				</TableCell>
				<TableCell>
					<Typography color="textSecondary" fontWeight="400">
						{row.pro_total_sessions}
					</Typography>
				</TableCell>
				{/**ACCION EDITAR - ELIMINAR CON ICONOS */}
				<TableCell align="center">
					<IconButton
						color="primary"
						aria-label="editar"
						onClick={() => {
							// handleEdit(row);
							console.log("EDIT");
						}}
					>
						<EditOutlined />
					</IconButton>
					<IconButton
						color="error"
						aria-label="desactivar"
						onClick={() => {
							// handleDeactivate(row);
							console.log("DELETE");
						}}
					>
						<DeleteOutline />
					</IconButton>
				</TableCell>
			</TableRow>
			<TableRow>
				<TableCell sx={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
					<Collapse in={open} timeout="auto" unmountOnExit>
						<Box margin={1}>
							<Typography
								gutterBottom
								variant="h5"
								sx={{
									mt: 2,
									backgroundColor: (theme) => theme.palette.grey.A200,
								}}
							>
								Detalles
							</Typography>
							<Typography mb={1}>{row.pro_description}</Typography>
							<Typography variant="body1" color="textSecondary">
								Código: {row.pro_code} | Duración: {row.pro_duration_days} días
								| Tipo de Terapia: {row.tht_name}
							</Typography>
							{row.ppr_name && (
								<Box mt={3}>
									<Paper
										elevation={3}
										sx={{
											p: 2,
											backgroundColor: "#e8f5e9",
											borderLeft: "5px solid #2e7d32",
										}}
									>
										<Typography
											variant="subtitle2"
											color="textSecondary"
											gutterBottom
										>
											Promoción activa
										</Typography>
										<Typography
											variant="h6"
											fontWeight={600}
											sx={{ color: "#2e7d32" }}
										>
											{row.ppr_name}
										</Typography>
										<Typography variant="body2" sx={{ mt: 0.5 }}>
											{row.ppr_description}
										</Typography>
										<Typography variant="body2" sx={{ mt: 1 }}>
											<strong>Descuento:</strong> {row.ppr_discount_percent}%{" "}
											<br />
											<strong>Vigencia:</strong> {row.ppr_start_date} -{" "}
											{row.ppr_end_date}
										</Typography>
									</Paper>
								</Box>
							)}
						</Box>
					</Collapse>
				</TableCell>
			</TableRow>
		</>
	);
}

Row.propTypes = {
	row: PropTypes.object.isRequired,
};

const BCrumb = [
	{
		to: "/",
		title: "Home",
	},
	{
		title: "Productos",
	},
];

const ProductsTable = () => {
	const { data } = useFetch("http://localhost:5000/admin/product/list");
	const navigate = useNavigate();

	const rows = useMemo(() => {
		return data?.data || [];
	}, [data]);

	return (
		<PageContainer
			title="Productos"
			description="Listado de productos con detalles"
		>
			<Breadcrumb title="Productos" items={BCrumb} />
			<Button
				variant="contained"
				color="primary"
				startIcon={
					<svg
						xmlns="http://www.w3.org/2000/svg"
						height="24"
						width="24"
						viewBox="0 0 24 24"
						fill="none"
					>
						<path
							d="M12 5v14M5 12h14"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
						/>
					</svg>
				}
				onClick={() => {
					navigate("/admin/products/register");
				}}
				sx={{ mb: 2, textTransform: "none", fontWeight: 600 }}
			>
				Crear Product
			</Button>
			<ParentCard title="Lista de Productos">
				<Paper variant="outlined">
					<TableContainer component={Paper}>
						<Table
							aria-label="collapsible table"
							sx={{ whiteSpace: { xs: "nowrap", sm: "unset" } }}
						>
							<TableHead>
								<TableRow>
									<TableCell />
									<TableCell>
										<Typography variant="h6">Producto</Typography>
									</TableCell>
									<TableCell>
										<Typography variant="h6">Creado por</Typography>
									</TableCell>
									<TableCell>
										<Typography variant="h6">Estado</Typography>
									</TableCell>
									<TableCell>
										<Typography variant="h6">Precio</Typography>
									</TableCell>
									<TableCell>
										<Typography variant="h6">Sesiones</Typography>
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{rows.map((row) => (
									<Row key={row.pro_id} row={row} />
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</Paper>
			</ParentCard>
		</PageContainer>
	);
};

export default ProductsTable;
