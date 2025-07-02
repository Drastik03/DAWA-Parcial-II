import * as React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import {
	TableHead,
	Box,
	Table,
	TableBody,
	TableCell,
	TablePagination,
	TableRow,
	TableFooter,
	IconButton,
	Paper,
	TableContainer,
	Alert,
	Typography,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
} from "@mui/material";

import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";

import Breadcrumb from "../../layouts/full/shared/breadcrumb/Breadcrumb";
import PageContainer from "../../components/container/PageContainer";
import ParentCard from "../../components/shared/ParentCard";
import {
	DeleteOutline,
	DeleteOutlined,
	EditOutlined,
} from "@mui/icons-material";
import { updateRole } from "../../services/admin/roleService";
import { deleteRole } from "../../services/admin/roleService";
import { useNavigate } from "react-router";

function TablePaginationActions(props) {
	const theme = useTheme();
	const { count, page, rowsPerPage, onPageChange } = props;

	const handleFirstPageButtonClick = (event) => {
		onPageChange(event, 0);
	};

	const handleBackButtonClick = (event) => {
		onPageChange(event, page - 1);
	};

	const handleNextButtonClick = (event) => {
		onPageChange(event, page + 1);
	};

	const handleLastPageButtonClick = (event) => {
		onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
	};

	return (
		<Box sx={{ flexShrink: 0, ml: 2.5 }}>
			<IconButton
				onClick={handleFirstPageButtonClick}
				disabled={page === 0}
				aria-label="first page"
			>
				{theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
			</IconButton>
			<IconButton
				onClick={handleBackButtonClick}
				disabled={page === 0}
				aria-label="previous page"
			>
				{theme.direction === "rtl"
					? <KeyboardArrowRight />
					: <KeyboardArrowLeft />}
			</IconButton>
			<IconButton
				onClick={handleNextButtonClick}
				disabled={page >= Math.ceil(count / rowsPerPage) - 1}
				aria-label="next page"
			>
				{theme.direction === "rtl"
					? <KeyboardArrowLeft />
					: <KeyboardArrowRight />}
			</IconButton>
			<IconButton
				onClick={handleLastPageButtonClick}
				disabled={page >= Math.ceil(count / rowsPerPage) - 1}
				aria-label="last page"
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

const BCrumb = [
	{
		to: "/",
		title: "Home",
	},
	{
		title: "Roles",
	},
];

const RolePaginationTable = ({ list = [], onRefresh }) => {
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(5);
	const [alertOpen, setAlertOpen] = React.useState(false);
	const [alertMessage, setAlertMessage] = React.useState("");
	const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
	const [selectedToDelete, setSelectedToDelete] = React.useState(null);
	const [alertSeverity, setAlertSeverity] = React.useState("success");
	const navigate = useNavigate();
	console.log(selectedToDelete);

	const [editModalOpen, setEditModalOpen] = React.useState(false);
	const [editData, setEditData] = React.useState({
		rol_id: "",
		rol_name: "",
		rol_description: "",
	});

	const rows = Array.isArray(list) ? list : [];
	const emptyRows =
		rowsPerPage > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		const value = parseInt(event.target.value, 10);
		setRowsPerPage(value);
		setPage(0);
	};

	React.useEffect(() => {
		if (alertOpen) {
			const timer = setTimeout(() => {
				setAlertOpen(false);
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [alertOpen]);

	const handleEditOpen = (row) => {
		setEditData({
			rol_id: row.rol_id,
			rol_name: row.rol_name,
			rol_description: row.rol_description,
		});
		setEditModalOpen(true);
	};

	const handleEditClose = () => {
		setEditModalOpen(false);
	};

	const handleEditChange = (e) => {
		const { name, value } = e.target;
		setEditData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleEditSave = async () => {
		try {
			const res = await updateRole({
				rol_id: editData.rol_id,
				rol_name: editData.rol_name,
				rol_description: editData.rol_description,
			});
			if (res.result) {
				setAlertMessage("Rol actualizado correctamente");
				setAlertSeverity("success");
				setAlertOpen(true);
				setEditModalOpen(false);
				onRefresh();
			} else {
				setAlertMessage("No se pudo actualizar el rol");
				setAlertSeverity("error");
				setAlertOpen(true);
			}
		} catch (error) {
			setAlertMessage("Error al actualizar el rol");
			setAlertSeverity("error");
			setAlertOpen(true);
		}
	};

	const handleDelete = async (data) => {
		try {
			const res = await deleteRole(data);
			if (res.result) {
				setAlertMessage("Rol eliminado correctamente");
				setAlertSeverity("success");
				setAlertOpen(true);
				onRefresh();
			} else {
				setAlertMessage("No se pudo eliminar el rol");
				setAlertSeverity("error");
				setAlertOpen(true);
			}
		} catch (error) {
			setAlertMessage("Error al eliminar el rol");
			setAlertSeverity("error");
			setAlertOpen(true);
		}
	};

	return (
		<PageContainer title="Roles" description="Tabla de roles con paginación">
			<Breadcrumb title="Roles" items={BCrumb} />
			<ParentCard title="Roles Registrados">
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
						navigate("/security/role/Register");
					}}
					sx={{ mb: 2, textTransform: "none", fontWeight: 600 }}
				>
					Crear Módulo
				</Button>
				<Paper variant="outlined">
					<TableContainer>
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
						<Table
							aria-label="custom pagination table"
							sx={{ whiteSpace: "nowrap" }}
						>
							<TableHead>
								<TableRow>
									<TableCell>
										<Typography
											variant="h6"
											sx={{ display: "flex", alignItems: "center" }}
										>
											<span
												className="material-icons"
												style={{ marginRight: 4 }}
											>
												tag
											</span>
											ID
										</Typography>
									</TableCell>
									<TableCell>
										<Typography
											variant="h6"
											sx={{ display: "flex", alignItems: "center" }}
										>
											<span
												className="material-icons"
												style={{ marginRight: 4 }}
											>
												person
											</span>
											Nombre
										</Typography>
									</TableCell>
									<TableCell>
										<Typography
											variant="h6"
											sx={{ display: "flex", alignItems: "center" }}
										>
											<span
												className="material-icons"
												style={{ marginRight: 4 }}
											>
												description
											</span>
											Descripción
										</Typography>
									</TableCell>
									<TableCell align="center">
										<Typography
											variant="h6"
											sx={{
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<span
												className="material-icons"
												style={{ marginRight: 4 }}
											>
												settings
											</span>
											Acciones
										</Typography>
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{(rowsPerPage > 0
									? rows.slice(
											page * rowsPerPage,
											page * rowsPerPage + rowsPerPage,
										)
									: rows
								).map((row) => (
									<TableRow key={row.rol_id}>
										<TableCell>{row.rol_id}</TableCell>
										<TableCell>{row.rol_name}</TableCell>
										<TableCell>{row.rol_description}</TableCell>
										<TableCell align="center">
											<IconButton
												color="primary"
												aria-label="editar"
												onClick={() => handleEditOpen(row)}
											>
												<EditOutlined />
											</IconButton>
											<IconButton
												color="error"
												aria-label="desactivar"
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
										SelectProps={{
											inputProps: { "aria-label": "Filas por página" },
											native: true,
										}}
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
				open={confirmDeleteOpen}
				onClose={() => setConfirmDeleteOpen(false)}
			>
				<DialogTitle>¿Confirmar eliminación?</DialogTitle>
				<DialogContent>
					<Typography>
						¿Estás seguro que deseas eliminar el rol{" "}
						<strong>{selectedToDelete?.rol_name}</strong>?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setConfirmDeleteOpen(false)}>Cancelar</Button>
					<Button
						color="error"
						variant="contained"
						onClick={async () => {
							await handleDelete(selectedToDelete.rol_id);
							setConfirmDeleteOpen(false);
						}}
					>
						Eliminar
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={editModalOpen}
				onClose={handleEditClose}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Editar Rol</DialogTitle>
				<DialogContent>
					<TextField
						margin="dense"
						label="Nombre"
						type="text"
						fullWidth
						value={editData.rol_name}
						name="rol_name"
						onChange={handleEditChange}
					/>
					<TextField
						margin="dense"
						label="Descripción"
						type="text"
						fullWidth
						value={editData.rol_description}
						name="rol_description"
						onChange={handleEditChange}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleEditClose}>Cancelar</Button>
					<Button onClick={handleEditSave} variant="contained" color="primary">
						Guardar
					</Button>
				</DialogActions>
			</Dialog>
		</PageContainer>
	);
};

export default RolePaginationTable;
