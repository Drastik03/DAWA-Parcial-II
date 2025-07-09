import React, { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
	Typography,
	Box,
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
	Stack,
	Avatar,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Grid,
	FormControl,
	Autocomplete,
	Snackbar,
	Alert,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import { DeleteOutline, EditOutlined } from "@mui/icons-material";

import { useFetch } from "../../../../hooks/useFetch";
import PageContainer from "../../../../components/container/PageContainer";
import ParentCard from "../../../../components/shared/ParentCard";
import Breadcrumb from "../../../../layouts/full/shared/breadcrumb/Breadcrumb";
import { useAuth } from "../../../../context/AuthContext";
import {
	createPromotion,
	deletePromotion,
	updatePromotion,
} from "../../../../services/admin/promotionSevice";

function Row({ row, onEdit, onDelete }) {
	const [open, setOpen] = useState(false);

	const formatDateString = (dateStr) => {
		if (!dateStr) return "";
		const parts = dateStr.split("/");
		if (parts.length !== 3) return dateStr;
		let year = parts[2];
		year = year.length === 2 ? "20" + year : year;
		return `${parts[0]}/${parts[1]}/${year}`;
	};

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
						<Typography variant="h6" fontWeight="600">
							{row.ppr_name}
						</Typography>
					</Stack>
				</TableCell>
				<TableCell>
					<Typography color="textSecondary" variant="h6">
						{row.pro_name}
					</Typography>
				</TableCell>
				<TableCell>
					<Chip
						size="small"
						label={row.ppr_state ? "Activo" : "Inactivo"}
						color={row.ppr_state ? "primary" : "error"}
						sx={{ borderRadius: "6px" }}
					/>
				</TableCell>
				<TableCell>
					<Typography color="textSecondary" variant="h6" fontWeight="400">
						{row.discount_percent}%
					</Typography>
				</TableCell>
				<TableCell>
					<Typography color="textSecondary" fontWeight="400">
						{row.ppr_extra_sessions}
					</Typography>
				</TableCell>
				<TableCell align="center">
					<IconButton
						color="primary"
						aria-label="editar"
						onClick={() => onEdit(row)}
					>
						<EditOutlined />
					</IconButton>
					<IconButton
						color="error"
						aria-label="eliminar"
						onClick={() => onDelete(row)}
					>
						<DeleteOutline />
					</IconButton>
				</TableCell>
			</TableRow>

			<TableRow>
				<TableCell sx={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
					<Collapse in={open} timeout="auto" unmountOnExit>
						<Box margin={1}>
							<Typography
								gutterBottom
								variant="h5"
								sx={{
									mt: 2,
									backgroundColor: (theme) => theme.palette.grey.A200,
									p: 1,
								}}
							>
								Detalles de la promoción
							</Typography>
							<Typography mb={1}>{row.ppr_description}</Typography>
							<Typography variant="body1" color="textSecondary">
								Vigencia: {formatDateString(row.start_date)} -{" "}
								{formatDateString(row.end_date)}
								<br />
								Creado por: {row.user_created}
								<br />
								Fecha creación: {row.date_created}
							</Typography>
						</Box>
					</Collapse>
				</TableCell>
			</TableRow>
		</>
	);
}

Row.propTypes = {
	row: PropTypes.object.isRequired,
	onEdit: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
};

const BCrumb = [
	{
		to: "/",
		title: "Home",
	},
	{
		title: "Promociones",
	},
];

const PromotionTable = () => {
	const { data, refetch } = useFetch(
		"http://localhost:5000/admin/promotion/list",
	);
	console.log(data);

	const { data: productData } = useFetch(
		"http://localhost:5000/admin/product/list",
	);
	const products = useMemo(() => {
		const list = Array.isArray(productData?.data) ? productData.data : [];
		const seen = new Set();
		return list.filter((p) => {
			if (seen.has(p.pro_id)) return false;
			seen.add(p.pro_id);
			return true;
		});
	}, [productData]);
	const [searchTerm, setSearchTerm] = useState("");
	const [openCreate, setOpenCreate] = useState(false);

	const handleOpenCreate = () => {
		setOpenCreate(true);
		reset({
			ppr_name: "",
			ppr_description: "",
			ppr_discount_percent: "",
			ppr_extra_sessions: "",
			ppr_product_id: null,
			ppr_start_date: "",
			ppr_end_date: "",
		});
	};
	const { user } = useAuth();

	const rows = useMemo(() => {
		const originalRows = data?.data || [];
		if (!searchTerm) return originalRows;

		return originalRows.filter((row) =>
			row.ppr_name?.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [data, searchTerm]);

	const [openEdit, setOpenEdit] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);
	const [selectedRow, setSelectedRow] = useState(null);

	const [formData, setFormData] = useState({
		ppr_id: "",
		ppr_product_id: "",
		ppr_name: "",
		ppr_description: "",
		ppr_discount_percent: "",
		ppr_extra_sessions: "",
		ppr_start_date: "",
		ppr_end_date: "",
	});

	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState("success");

	useEffect(() => {
		if (selectedRow) {
			setFormData({
				ppr_id: selectedRow.ppr_id || "",
				ppr_product_id: selectedRow.ppr_product_id || "",
				ppr_name: selectedRow.ppr_name || "",
				ppr_description: selectedRow.ppr_description || "",
				ppr_discount_percent: selectedRow.discount_percent?.toString() || "",
				ppr_extra_sessions: selectedRow.ppr_extra_sessions?.toString() || "",
				ppr_start_date: selectedRow.start_date
					? selectedRow.start_date.split("/").reverse().join("-")
					: "",
				ppr_end_date: selectedRow.end_date
					? selectedRow.end_date.split("/").reverse().join("-")
					: "",
			});
		} else {
			setFormData({
				ppr_id: "",
				ppr_product_id: "",
				ppr_name: "",
				ppr_description: "",
				ppr_discount_percent: "",
				ppr_extra_sessions: "",
				ppr_start_date: "",
				ppr_end_date: "",
			});
		}
	}, [selectedRow]);

	const handleEditOpen = (row) => {
		setSelectedRow(row);
		setOpenEdit(true);
	};

	const handleDeleteOpen = (row) => {
		setSelectedRow(row);
		setOpenDelete(true);
	};

	const handleClose = () => {
		setOpenEdit(false);
		setOpenDelete(false);
		setSelectedRow(null);
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleEditSubmit = async () => {
		const discount = parseFloat(formData.ppr_discount_percent);
		if (isNaN(discount)) {
			setSnackbarSeverity("error");
			setSnackbarMessage("El descuento debe ser un número válido.");
			setSnackbarOpen(true);
			return;
		}

		const payload = {
			ppr_id: formData.ppr_id,
			ppr_product_id: formData.ppr_product_id,
			ppr_name: formData.ppr_name,
			ppr_description: formData.ppr_description,
			ppr_discount_percent: discount,
			ppr_extra_sessions: parseInt(formData.ppr_extra_sessions) || 0,
			ppr_start_date: formData.ppr_start_date,
			ppr_end_date: formData.ppr_end_date,
			user_process: user.user.user_login_id,
		};

		try {
			const res = await updatePromotion(payload);
			if (res.result) {
				setSnackbarSeverity("success");
				setSnackbarMessage("Promoción actualizada correctamente.");
				refetch();
			} else {
				setSnackbarSeverity("error");
				setSnackbarMessage(
					res.message || "No se pudo actualizar la promoción.",
				);
			}
		} catch {
			setSnackbarSeverity("error");
			setSnackbarMessage("Error inesperado al actualizar la promoción.");
		}

		setSnackbarOpen(true);
		handleClose();
	};

	const handleDeleteConfirm = async () => {
		try {
			const res = await deletePromotion(selectedRow.ppr_id);
			if (res) {
				setSnackbarSeverity("success");
				setSnackbarMessage("Promoción eliminada correctamente.");
				refetch();
			} else {
				setSnackbarSeverity("error");
				setSnackbarMessage("Error al eliminar la promoción.");
			}
		} catch {
			setSnackbarSeverity("error");
			setSnackbarMessage("Ocurrió un error inesperado.");
		}
		setSnackbarOpen(true);
		handleClose();
	};
	const handleCreateSubmit = async () => {
		const discount = parseFloat(formData.ppr_discount_percent);
		if (isNaN(discount)) {
			setSnackbarSeverity("error");
			setSnackbarMessage("El descuento debe ser un número válido.");
			setSnackbarOpen(true);
			return;
		}

		const payload = {
			ppr_product_id: formData.ppr_product_id,
			ppr_name: formData.ppr_name,
			ppr_description: formData.ppr_description,
			ppr_discount_percent: discount,
			ppr_extra_sessions: parseInt(formData.ppr_extra_sessions) || 0,
			ppr_start_date: formData.ppr_start_date,
			ppr_end_date: formData.ppr_end_date,
			user_process: user.user.user_login_id,
		};

		try {
			const data = {
				...payload,
				user_created: user.user.user_login_id,
			};
			delete data.user_process;
			const res = await createPromotion(data);
			if (res.result) {
				setSnackbarSeverity("success");
				setSnackbarMessage("Promoción creada correctamente.");
				setOpenCreate(false);
				refetch();
			} else {
				setSnackbarSeverity("error");
				setSnackbarMessage(res.message || "Error al crear promoción.");
			}
		} catch {
			setSnackbarSeverity("error");
			setSnackbarMessage("Error inesperado al crear promoción.");
		}

		setSnackbarOpen(true);
		handleClose();
	};

	return (
		<>
			<PageContainer
				title="Promociones"
				description="Listado de promociones activas e inactivas"
			>
				<Breadcrumb title="Promociones" items={BCrumb} />
				<ParentCard title="Lista de Promociones">
					<Stack
						direction={{ xs: "column", sm: "row" }}
						justifyContent="space-between"
						alignItems="center"
						spacing={2}
						sx={{ mb: 2 }}
					>
						<Box sx={{ width: { xs: "100%", sm: "300px" } }}>
							<TextField
								label="Buscar promoción"
								variant="outlined"
								fullWidth
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</Box>

						<Button
							variant="contained"
							color="primary"
							sx={{ whiteSpace: "nowrap", minWidth: 180 }}
							onClick={() => {
								setSelectedRow(null);
								setOpenCreate(true);
							}}
						>
							Crear nueva promoción
						</Button>
					</Stack>

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
											<Typography variant="h6">Nombre promoción</Typography>
										</TableCell>
										<TableCell>
											<Typography variant="h6">Producto</Typography>
										</TableCell>
										<TableCell>
											<Typography variant="h6">Estado</Typography>
										</TableCell>
										<TableCell>
											<Typography variant="h6">Descuento</Typography>
										</TableCell>
										<TableCell>
											<Typography variant="h6">Sesiones extras</Typography>
										</TableCell>
										<TableCell align="center">
											<Typography variant="h6">Acciones</Typography>
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{rows.map((row) => (
										<Row
											key={row.ppr_id}
											row={row}
											onEdit={handleEditOpen}
											onDelete={handleDeleteOpen}
										/>
									))}
									{rows.length === 0 && (
										<TableRow>
											<TableCell colSpan={7} align="center">
												<Typography variant="body2" color="textSecondary">
													No se encontraron promociones.
												</Typography>
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</TableContainer>
					</Paper>
				</ParentCard>
			</PageContainer>

			<Dialog open={openEdit} onClose={handleClose} fullWidth maxWidth="sm">
				<DialogTitle sx={{ fontWeight: 700 }}>Editar Promoción</DialogTitle>
				<DialogContent sx={{ pt: 1 }}>
					<Grid container spacing={2} mt={1}>
						<Grid item xs={12}>
							<TextField
								label="Nombre"
								name="ppr_name"
								value={formData.ppr_name}
								onChange={handleInputChange}
								fullWidth
								autoFocus
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								label="Descripción"
								name="ppr_description"
								value={formData.ppr_description}
								onChange={handleInputChange}
								fullWidth
								multiline
								rows={3}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<TextField
								label="Descuento (%)"
								name="ppr_discount_percent"
								value={formData.ppr_discount_percent}
								onChange={handleInputChange}
								fullWidth
								type="number"
								inputProps={{ min: 0, max: 100, step: 0.1 }}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<TextField
								label="Sesiones extras"
								name="ppr_extra_sessions"
								value={formData.ppr_extra_sessions}
								onChange={handleInputChange}
								fullWidth
								type="number"
								inputProps={{ min: 0 }}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<FormControl fullWidth>
								<Autocomplete
									options={products}
									getOptionLabel={(option) => option.pro_name || ""}
									value={
										products.find(
											(p) => p.pro_id === Number(formData.ppr_product_id),
										) || null
									}
									onChange={(_, newValue) => {
										setFormData((prev) => ({
											...prev,
											ppr_product_id: newValue ? newValue.pro_id : "",
										}));
									}}
									renderInput={(params) => (
										<TextField {...params} label="Producto" />
									)}
								/>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={6}>
							<TextField
								label="Fecha inicio"
								name="ppr_start_date"
								type="date"
								value={formData.ppr_start_date}
								onChange={handleInputChange}
								fullWidth
								InputLabelProps={{ shrink: true }}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<TextField
								label="Fecha fin"
								name="ppr_end_date"
								type="date"
								value={formData.ppr_end_date}
								onChange={handleInputChange}
								fullWidth
								InputLabelProps={{ shrink: true }}
							/>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="inherit">
						Cancelar
					</Button>
					<Button
						onClick={handleEditSubmit}
						variant="contained"
						color="primary"
					>
						Guardar
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={openDelete} onClose={handleClose} fullWidth maxWidth="xs">
				<DialogTitle>Confirmar Eliminación</DialogTitle>
				<DialogContent>
					<Typography>
						¿Está seguro que desea eliminar la promoción{" "}
						<strong>{selectedRow?.ppr_name}</strong>?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="inherit">
						Cancelar
					</Button>
					<Button
						onClick={handleDeleteConfirm}
						variant="contained"
						color="error"
					>
						Eliminar
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={openCreate} onClose={handleClose} fullWidth maxWidth="sm">
				<DialogTitle sx={{ fontWeight: 700 }}>
					Crear Nueva Promoción
				</DialogTitle>
				<DialogContent sx={{ pt: 1 }}>
					<Grid container spacing={2} mt={1}>
						<Grid item xs={12}>
							<TextField
								label="Nombre"
								name="ppr_name"
								value={formData.ppr_name}
								onChange={handleInputChange}
								fullWidth
								autoFocus
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								label="Descripción"
								name="ppr_description"
								value={formData.ppr_description}
								onChange={handleInputChange}
								fullWidth
								multiline
								rows={3}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<TextField
								label="Descuento (%)"
								name="ppr_discount_percent"
								value={formData.ppr_discount_percent}
								onChange={handleInputChange}
								fullWidth
								type="number"
								inputProps={{ min: 0, max: 100, step: 0.1 }}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<TextField
								label="Sesiones extras"
								name="ppr_extra_sessions"
								value={formData.ppr_extra_sessions}
								onChange={handleInputChange}
								fullWidth
								type="number"
								inputProps={{ min: 0 }}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<FormControl fullWidth>
								<Autocomplete
									options={products}
									getOptionLabel={(option) => option.pro_name || ""}
									value={
										products.find(
											(p) => p.pro_id === Number(formData.ppr_product_id),
										) || null
									}
									onChange={(_, newValue) => {
										setFormData((prev) => ({
											...prev,
											ppr_product_id: newValue ? newValue.pro_id : "",
										}));
									}}
									renderInput={(params) => (
										<TextField {...params} label="Producto" />
									)}
								/>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={6}>
							<TextField
								label="Fecha inicio"
								name="ppr_start_date"
								type="date"
								value={formData.ppr_start_date}
								onChange={handleInputChange}
								fullWidth
								InputLabelProps={{ shrink: true }}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<TextField
								label="Fecha fin"
								name="ppr_end_date"
								type="date"
								value={formData.ppr_end_date}
								onChange={handleInputChange}
								fullWidth
								InputLabelProps={{ shrink: true }}
							/>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenCreate(false)} color="inherit">
						Cancelar
					</Button>
					<Button
						onClick={handleCreateSubmit}
						variant="contained"
						color="primary"
					>
						Crear
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={snackbarOpen}
				autoHideDuration={4000}
				onClose={() => setSnackbarOpen(false)}
				anchorOrigin={{ vertical: "top", horizontal: "right" }}
			>
				<Alert
					onClose={() => setSnackbarOpen(false)}
					severity={snackbarSeverity}
					sx={{ width: "100%" }}
				>
					{snackbarMessage}
				</Alert>
			</Snackbar>
		</>
	);
};

export default PromotionTable;
