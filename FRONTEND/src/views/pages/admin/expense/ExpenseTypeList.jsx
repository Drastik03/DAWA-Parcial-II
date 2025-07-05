import React, { useState, useEffect } from "react";
import {
	Box,
	Button,
	TextField,
	Typography,
	Paper,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	TableContainer,
	TableFooter,
	TablePagination,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Snackbar,
	Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
	FirstPage as FirstPageIcon,
	LastPage as LastPageIcon,
	KeyboardArrowLeft,
	KeyboardArrowRight,
	Edit as EditIcon,
	Delete as DeleteIcon,
} from "@mui/icons-material";
import PropTypes from "prop-types";
import { useFetch } from "../../../../hooks/useFetch";
import {
	updateExpenseType,
	deleteExpenseType,
	createExpenseType,
} from "../../../../services/admin/expenseTypeService";
import { useAuth } from "../../../../context/AuthContext";

function TablePaginationActions({ count, page, rowsPerPage, onPageChange }) {
	const theme = useTheme();
	return (
		<Box sx={{ flexShrink: 0, ml: 2.5 }}>
			<IconButton onClick={(e) => onPageChange(e, 0)} disabled={page === 0}>
				{theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
			</IconButton>
			<IconButton
				onClick={(e) => onPageChange(e, page - 1)}
				disabled={page === 0}
			>
				{theme.direction === "rtl" ? (
					<KeyboardArrowRight />
				) : (
					<KeyboardArrowLeft />
				)}
			</IconButton>
			<IconButton
				onClick={(e) => onPageChange(e, page + 1)}
				disabled={page >= Math.ceil(count / rowsPerPage) - 1}
			>
				{theme.direction === "rtl" ? (
					<KeyboardArrowLeft />
				) : (
					<KeyboardArrowRight />
				)}
			</IconButton>
			<IconButton
				onClick={(e) =>
					onPageChange(e, Math.max(0, Math.ceil(count / rowsPerPage) - 1))
				}
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

const ExpenseTypeList = () => {
	const [searchText, setSearchText] = useState("");
	const [filteredData, setFilteredData] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const { user } = useAuth();
	const { data, refetch } = useFetch(
		"http://localhost:5000/admin/ExpenseType/list",
	);

	const [selectedItem, setSelectedItem] = useState(null);
	const [openEdit, setOpenEdit] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);
	const [openCreate, setOpenCreate] = useState(false);

	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "success",
	});

	useEffect(() => {
		if (!searchText) {
			setFilteredData(data?.data || []);
		} else {
			const filtered = (data?.data || []).filter((item) =>
				item.ext_name.toLowerCase().includes(searchText.toLowerCase()),
			);
			setFilteredData(filtered);
		}
		setPage(0);
	}, [searchText, data]);

	const handleChangePage = (_, newPage) => setPage(newPage);
	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleEdit = (item) => {
		setSelectedItem(item);
		setOpenEdit(true);
	};

	const handleDelete = (item) => {
		setSelectedItem(item);
		setOpenDelete(true);
	};

	const handleSaveEdit = async () => {
		const payload = {
			ext_id: selectedItem.ext_id,
			ext_name: selectedItem.ext_name,
			ext_description: selectedItem.ext_description || "",
			user_created: user.user.user_login_id,
		};
		const res = await updateExpenseType(payload);
		if (res.result) {
			setSnackbar({
				open: true,
				message: "Tipo de gasto actualizado correctamente.",
				severity: "success",
			});
			refetch();
			setOpenEdit(false);
		} else {
			setSnackbar({ open: true, message: res.message, severity: "error" });
		}
	};

	const handleConfirmDelete = async () => {
		const res = await deleteExpenseType(selectedItem.ext_id);
		if (res.result) {
			setSnackbar({
				open: true,
				message: "Tipo de gasto eliminado correctamente.",
				severity: "info",
			});
			refetch();
			setOpenDelete(false);
		} else {
			setSnackbar({ open: true, message: res.message, severity: "error" });
		}
	};

	// Estado para nuevo tipo de gasto
	const [newExpenseType, setNewExpenseType] = useState({
		ext_name: "",
		ext_description: "",
	});

	const handleCreateChange = (field) => (e) => {
		setNewExpenseType({ ...newExpenseType, [field]: e.target.value });
	};

	const handleSaveCreate = async () => {
		if (!newExpenseType.ext_name.trim()) {
			setSnackbar({
				open: true,
				message: "El nombre es obligatorio.",
				severity: "warning",
			});
			return;
		}
		const payload = {
			ext_name: newExpenseType.ext_name,
			ext_description: newExpenseType.ext_description || "",
			user_created: user.user.user_login_id,
		};
		const res = await createExpenseType(payload);
		if (res.result) {
			setSnackbar({
				open: true,
				message: "Tipo de gasto creado correctamente.",
				severity: "success",
			});
			refetch();
			setOpenCreate(false);
			setNewExpenseType({ ext_name: "", ext_description: "" });
		} else {
			setSnackbar({ open: true, message: res.message, severity: "error" });
		}
	};

	return (
		<Box p={2}>
			<Typography variant="h5" mb={2}>
				Listado de Tipos de Gasto
			</Typography>

			<Box
				display="flex"
				gap={2}
				mb={2}
				flexWrap="wrap"
				justifyContent="space-between"
				alignItems="center"
			>
				<TextField
					label="Buscar por nombre"
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					sx={{ flexGrow: 1, minWidth: 70 }}
				/>
				<Button variant="contained" onClick={() => setOpenCreate(true)}>
					Crear Nuevo
				</Button>
			</Box>

			<Paper variant="outlined">
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>ID</TableCell>
								<TableCell>Nombre</TableCell>
								<TableCell>Descripción</TableCell>
								<TableCell>Usuario</TableCell>
								<TableCell>Fecha</TableCell>
								<TableCell>Acciones</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{(rowsPerPage > 0
								? filteredData.slice(
										page * rowsPerPage,
										page * rowsPerPage + rowsPerPage,
									)
								: filteredData
							).map((row) => (
								<TableRow key={row.ext_id}>
									<TableCell>{row.ext_id}</TableCell>
									<TableCell>{row.ext_name}</TableCell>
									<TableCell>
										{row.ext_description || "Sin descripción"}
									</TableCell>
									<TableCell>{row.user_created}</TableCell>
									<TableCell>{row.date_created}</TableCell>
									<TableCell>
										<IconButton color="primary" onClick={() => handleEdit(row)}>
											<EditIcon />
										</IconButton>
										<IconButton color="error" onClick={() => handleDelete(row)}>
											<DeleteIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
							{filteredData.length === 0 && (
								<TableRow>
									<TableCell colSpan={6} align="center">
										No se encontraron tipos de gasto.
									</TableCell>
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
										{ label: "Todos", value: -1 },
									]}
									count={filteredData.length}
									rowsPerPage={rowsPerPage}
									page={page}
									onPageChange={handleChangePage}
									onRowsPerPageChange={handleChangeRowsPerPage}
									ActionsComponent={TablePaginationActions}
									colSpan={6}
								/>
							</TableRow>
						</TableFooter>
					</Table>
				</TableContainer>
			</Paper>

			{/* Modal Editar */}
			<Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
				<DialogTitle>Editar Tipo de Gasto</DialogTitle>
				<DialogContent>
					<TextField
						label="Nombre"
						fullWidth
						margin="dense"
						value={selectedItem?.ext_name || ""}
						onChange={(e) =>
							setSelectedItem({ ...selectedItem, ext_name: e.target.value })
						}
					/>
					<TextField
						label="Descripción"
						fullWidth
						margin="dense"
						value={selectedItem?.ext_description || ""}
						onChange={(e) =>
							setSelectedItem({
								...selectedItem,
								ext_description: e.target.value,
							})
						}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenEdit(false)}>Cancelar</Button>
					<Button variant="contained" onClick={handleSaveEdit}>
						Guardar
					</Button>
				</DialogActions>
			</Dialog>

			{/* Modal Eliminar */}
			<Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
				<DialogTitle>¿Eliminar Tipo de Gasto?</DialogTitle>
				<DialogContent>
					<Typography>
						¿Estás seguro de que deseas eliminar "{selectedItem?.ext_name}"?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenDelete(false)}>Cancelar</Button>
					<Button
						color="error"
						variant="contained"
						onClick={handleConfirmDelete}
					>
						Eliminar
					</Button>
				</DialogActions>
			</Dialog>

			{/* Modal Crear Nuevo */}
			<Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
				<DialogTitle>Crear Nuevo Tipo de Gasto</DialogTitle>
				<DialogContent>
					<TextField
						label="Nombre"
						fullWidth
						margin="dense"
						value={newExpenseType.ext_name}
						onChange={handleCreateChange("ext_name")}
					/>
					<TextField
						label="Descripción"
						fullWidth
						margin="dense"
						value={newExpenseType.ext_description}
						onChange={handleCreateChange("ext_description")}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenCreate(false)}>Cancelar</Button>
					<Button variant="contained" onClick={handleSaveCreate}>
						Crear
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={() => setSnackbar({ ...snackbar, open: false })}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
			>
				<Alert
					severity={snackbar.severity}
					variant="filled"
					sx={{ width: "100%" }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
};

export default ExpenseTypeList;
