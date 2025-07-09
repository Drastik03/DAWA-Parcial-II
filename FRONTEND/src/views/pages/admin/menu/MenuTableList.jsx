import * as React from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableFooter,
	TableHead,
	TablePagination,
	TableRow,
	IconButton,
	Paper,
	Box,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Typography,
	Alert,
	Grid,
	FormControl,
	Autocomplete,
} from "@mui/material";
import {
	EditOutlined,
	DeleteOutlined,
	FirstPage as FirstPageIcon,
	LastPage as LastPageIcon,
	KeyboardArrowLeft,
	KeyboardArrowRight,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import { useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import Breadcrumb from "../../../../layouts/full/shared/breadcrumb/Breadcrumb";
import ParentCard from "../../../../components/shared/ParentCard";
import PageContainer from "../../../../components/container/PageContainer";
import { useFetch } from "../../../../hooks/useFetch";
import { deleteMenu, updateMenu } from "../../../../services/admin/menuservice";
import { Stack } from "@mui/system";

function TablePaginationActions({ count, page, rowsPerPage, onPageChange }) {
	const theme = useTheme();
	const handleFirstPageButtonClick = (event) => onPageChange(event, 0);
	const handleBackButtonClick = (event) => onPageChange(event, page - 1);
	const handleNextButtonClick = (event) => onPageChange(event, page + 1);
	const handleLastPageButtonClick = (event) =>
		onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));

	return (
		<Box sx={{ flexShrink: 0, ml: 2.5 }}>
			<IconButton onClick={handleFirstPageButtonClick} disabled={page === 0}>
				{theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
			</IconButton>
			<IconButton onClick={handleBackButtonClick} disabled={page === 0}>
				{theme.direction === "rtl" ? (
					<KeyboardArrowRight />
				) : (
					<KeyboardArrowLeft />
				)}
			</IconButton>
			<IconButton
				onClick={handleNextButtonClick}
				disabled={page >= Math.ceil(count / rowsPerPage) - 1}
			>
				{theme.direction === "rtl" ? (
					<KeyboardArrowLeft />
				) : (
					<KeyboardArrowRight />
				)}
			</IconButton>
			<IconButton
				onClick={handleLastPageButtonClick}
				disabled={page >= Math.ceil(count / rowsPerPage) - 1}
			>
				{theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
			</IconButton>
		</Box>
	);
}

TablePaginationActions.propTypes = {
	count: PropTypes.number.isRequired,
	onPageChange: PropTypes.func.isRequired,
	page: PropTypes.number.isRequired,
	rowsPerPage: PropTypes.number.isRequired,
};

const BCrumb = [{ to: "/", title: "Inicio" }, { title: "Menús" }];

const MenuPaginationTable = () => {
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(5);
	const [editModalOpen, setEditModalOpen] = React.useState(false);
	const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
	const [selectedToDelete, setSelectedToDelete] = React.useState(null);
	const [editData, setEditData] = React.useState({});
	const [alertOpen, setAlertOpen] = React.useState(false);
	const [alertMessage, setAlertMessage] = React.useState("");
	const [alertSeverity, setAlertSeverity] = React.useState("success");
	const [searchTerm, setSearchTerm] = React.useState("");
	const navigate = useNavigate();
	const { data, refetch } = useFetch("http://localhost:5000/Menu/list");
	const { data: modulesData } = useFetch("http://localhost:5000/Module/list");
	const modules = Array.isArray(modulesData) ? modulesData : [];
	const rows = Array.isArray(data) ? data : [];
	const filteredRows = rows.filter((row) =>
		row.menu_name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const emptyRows =
		rowsPerPage > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

	React.useEffect(() => {
		if (page > 0 && page * rowsPerPage >= filteredRows.length) {
			setPage(0);
		}
	}, [filteredRows, page, rowsPerPage]);
	const {
		control,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm();

	const handleChangePage = (_, newPage) => setPage(newPage);
	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleEditOpen = (row) => {
		setEditData(row);
		setValue("menu_name", row.menu_name || "");
		setValue("menu_url", row.menu_url || "");
		setValue("menu_module_id", row.menu_module_id ?? null);
		setValue("menu_parent_id", row.menu_parent_id ?? "");
		setValue("menu_order", row.menu_order ?? "");
		setValue("menu_href", row.menu_href || "");
		setValue("menu_icon_name", row.menu_icon_name || "");
		setEditModalOpen(true);
	};

	const onSubmit = async (formData) => {
		try {
			const payload = {
				menu_id: editData.menu_id,
				menu_name: formData.menu_name,
				menu_url: formData.menu_url,
				menu_module_id: parseInt(formData.menu_module_id),
				menu_parent_id: formData.menu_parent_id
					? parseInt(formData.menu_parent_id)
					: null,
				menu_order: parseInt(formData.menu_order),
				menu_href: formData.menu_href,
				menu_icon_name: formData.menu_icon_name,
			};

			const res = await updateMenu(payload);
			if (res.result) {
				setAlertMessage("Menú actualizado correctamente");
				setAlertSeverity("success");
				setAlertOpen(true);
				setEditModalOpen(false);
				refetch();
			} else throw new Error();
		} catch {
			setAlertMessage("Error al actualizar el menú");
			setAlertSeverity("error");
			setAlertOpen(true);
		}
	};

	const handleDelete = async (id) => {
		try {
			const res = await deleteMenu(id);
			if (res.result) {
				setAlertMessage("Menú eliminado correctamente");
				setAlertSeverity("success");
				setAlertOpen(true);
				refetch();
			} else throw new Error();
		} catch {
			setAlertMessage("Error al eliminar el menú");
			setAlertSeverity("error");
			setAlertOpen(true);
		}
	};

	return (
		<PageContainer title="Menús" description="Tabla de menús con paginación">
			<Breadcrumb title="Menús" items={BCrumb} />
			<ParentCard title="Listado de Menús">
				<Stack
					direction={{ xs: "column", sm: "row" }}
					spacing={2}
					alignItems="center"
					justifyContent="space-between"
					sx={{ mb: 2 }}
				>
					<TextField
						label="Buscar menú"
						variant="outlined"
						size="small"
						fullWidth
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>

					<Button
						variant="contained"
						color="primary"
						onClick={() => navigate("/security/menu/Register")}
						sx={{ whiteSpace: "nowrap" }}
					>
						Crear Menú
					</Button>
				</Stack>

				{alertOpen && (
					<Box sx={{ mb: 2 }}>
						<Alert
							severity={alertSeverity}
							onClose={() => setAlertOpen(false)}
							variant="filled"
						>
							{alertMessage}
						</Alert>
					</Box>
				)}

				<Paper variant="outlined">
					<TableContainer>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>ID</TableCell>
									<TableCell>Nombre</TableCell>
									<TableCell>URL</TableCell>
									<TableCell align="center">Acciones</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{(rowsPerPage > 0
									? filteredRows.slice(
											page * rowsPerPage,
											page * rowsPerPage + rowsPerPage,
										)
									: filteredRows
								).map((row) => (
									<TableRow key={row.menu_id}>
										<TableCell>{row.menu_id}</TableCell>
										<TableCell>{row.menu_name}</TableCell>
										<TableCell>{row.menu_url || "Sin especificar"}</TableCell>
										<TableCell align="center">
											<IconButton
												color="primary"
												onClick={() => handleEditOpen(row)}
											>
												<EditOutlined />
											</IconButton>
											<IconButton
												color="error"
												onClick={() => {
													setSelectedToDelete(row);
													setConfirmDeleteOpen(true);
												}}
											>
												<DeleteOutlined />
											</IconButton>
										</TableCell>
									</TableRow>
								))}
								{emptyRows > 0 && (
									<TableRow style={{ height: 53 * emptyRows }}>
										<TableCell colSpan={4} />
									</TableRow>
								)}
							</TableBody>
							<TableFooter>
								<TableRow>
									<TablePagination
										rowsPerPageOptions={[
											5,
											10,
											25,
											{ label: "All", value: -1 },
										]}
										colSpan={4}
										count={rows.length}
										rowsPerPage={rowsPerPage}
										page={page}
										onPageChange={handleChangePage}
										onRowsPerPageChange={handleChangeRowsPerPage}
										ActionsComponent={TablePaginationActions}
									/>
								</TableRow>
							</TableFooter>
						</Table>
					</TableContainer>
				</Paper>
			</ParentCard>

			<Dialog
				open={editModalOpen}
				onClose={() => setEditModalOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Editar Menú</DialogTitle>
				<DialogContent>
					<Grid container spacing={2} sx={{ mt: 1 }}>
						{/* Nombre */}
						<Grid item xs={12} sm={3}>
							<Typography variant="subtitle2" sx={{ mt: 1 }}>
								Nombre
							</Typography>
						</Grid>
						<Grid item xs={12} sm={9}>
							<FormControl fullWidth>
								<Controller
									name="menu_name"
									control={control}
									rules={{ required: true }}
									render={({ field }) => (
										<TextField
											{...field}
											variant="outlined"
											error={!!errors.menu_name}
											helperText={errors.menu_name && "Campo requerido"}
										/>
									)}
								/>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={3}>
							<Typography variant="subtitle2" sx={{ mt: 1 }}>
								URL
							</Typography>
						</Grid>
						<Grid item xs={12} sm={9}>
							<FormControl fullWidth>
								<Controller
									name="menu_url"
									control={control}
									rules={{ required: true }}
									render={({ field }) => (
										<TextField
											{...field}
											variant="outlined"
											error={!!errors.menu_url}
											helperText={errors.menu_url && "Campo requerido"}
										/>
									)}
								/>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={3}>
							<Typography variant="subtitle2" sx={{ mt: 1 }}>
								Módulo
							</Typography>
						</Grid>
						<Grid item xs={12} sm={9}>
							<FormControl fullWidth>
								<Controller
									name="menu_module_id"
									control={control}
									rules={{ required: true }}
									render={({ field }) => (
										<Autocomplete
											options={modules}
											getOptionLabel={(option) =>
												typeof option === "string" ? option : option.mod_name
											}
											value={
												modules.find((mod) => mod.mod_id === field.value) ||
												null
											}
											onChange={(_, newValue) =>
												field.onChange(newValue ? newValue.mod_id : null)
											}
											renderInput={(params) => (
												<TextField
													{...params}
													variant="outlined"
													error={!!errors.menu_module_id}
													helperText={
														errors.menu_module_id && "Campo requerido"
													}
												/>
											)}
										/>
									)}
								/>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={3}>
							<Typography variant="subtitle2" sx={{ mt: 1 }}>
								Orden
							</Typography>
						</Grid>
						<Grid item xs={12} sm={9}>
							<FormControl fullWidth>
								<Controller
									name="menu_order"
									control={control}
									rules={{ required: true }}
									render={({ field }) => (
										<TextField
											{...field}
											type="number"
											variant="outlined"
											error={!!errors.menu_order}
											helperText={errors.menu_order && "Campo requerido"}
										/>
									)}
								/>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={3}>
							<Typography variant="subtitle2" sx={{ mt: 1 }}>
								Href
							</Typography>
						</Grid>
						<Grid item xs={12} sm={9}>
							<FormControl fullWidth>
								<Controller
									name="menu_href"
									control={control}
									rules={{ required: true }}
									render={({ field }) => (
										<TextField
											{...field}
											variant="outlined"
											error={!!errors.menu_href}
											helperText={errors.menu_href && "Campo requerido"}
										/>
									)}
								/>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={3}>
							<Typography variant="subtitle2" sx={{ mt: 1 }}>
								Icono
							</Typography>
						</Grid>
						<Grid item xs={12} sm={9}>
							<FormControl fullWidth>
								<Controller
									name="menu_icon_name"
									control={control}
									rules={{ required: true }}
									render={({ field }) => (
										<TextField
											{...field}
											variant="outlined"
											error={!!errors.menu_icon_name}
											helperText={errors.menu_icon_name && "Campo requerido"}
										/>
									)}
								/>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={3}>
							<Typography variant="subtitle2" sx={{ mt: 1 }}>
								Menú Padre ID
							</Typography>
						</Grid>
						<Grid item xs={12} sm={9}>
							<FormControl fullWidth>
								<Controller
									name="menu_parent_id"
									control={control}
									render={({ field }) => (
										<TextField {...field} type="number" variant="outlined" />
									)}
								/>
							</FormControl>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setEditModalOpen(false)}>Cancelar</Button>
					<Button
						onClick={handleSubmit(onSubmit)}
						variant="contained"
						color="primary"
					>
						Guardar
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={confirmDeleteOpen}
				onClose={() => setConfirmDeleteOpen(false)}
			>
				<DialogTitle>¿Confirmar eliminación?</DialogTitle>
				<DialogContent>
					<Typography>
						¿Seguro que deseas eliminar el menú{" "}
						<strong>{selectedToDelete?.menu_name}</strong>?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setConfirmDeleteOpen(false)}>Cancelar</Button>
					<Button
						variant="contained"
						color="error"
						onClick={async () => {
							await handleDelete(selectedToDelete.menu_id);
							setConfirmDeleteOpen(false);
						}}
					>
						Eliminar
					</Button>
				</DialogActions>
			</Dialog>
		</PageContainer>
	);
};

export default MenuPaginationTable;
