import React, { useState, useEffect } from "react";
import axios from "axios";
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
} from "@mui/material";
import {
	FirstPage as FirstPageIcon,
	LastPage as LastPageIcon,
	KeyboardArrowLeft,
	KeyboardArrowRight,
	EditOutlined,
	DeleteOutlined,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import Cookies from "js-cookie";
import { useFetch } from "../../../../hooks/useFetch";
import EditExpenseModal from "./EditExpenseModal";

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

const ExpenseReport = () => {
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [expenses, setExpenses] = useState([]);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	// Modal y selección
	const [selectedToEdit, setSelectedToEdit] = useState(null);
	const [editModalOpen, setEditModalOpen] = useState(false);

	const {
		data,
		error: errorFetch,
		refetch,
	} = useFetch("http://localhost:5000/admin/expense/list");

	useEffect(() => {
		if (!startDate && !endDate) {
			if (data?.data) {
				setExpenses(data.data);
			}
			setError(null);
		}
	}, [data, startDate, endDate]);

	const fetchExpenses = async (fromDate, toDate) => {
		setError(null);
		try {
			const url = `http://localhost:5000/admin/expense/list_by_date?from=${fromDate}&to=${toDate}`;
			const response = await axios.get(url, {
				headers: { tokenapp: Cookies.get("token") },
			});
			if (
				response.data?.result &&
				response.data.data?.result &&
				Array.isArray(response.data.data.data)
			) {
				setExpenses(response.data.data.data);
			} else {
				setExpenses([]);
				if (response.data?.message) setError(response.data.message);
			}
		} catch {
			setError("No se pudo obtener los datos.");
			setExpenses([]);
		} finally {
			setPage(0);
		}
	};

	const handleEditOpen = (expense) => {
		setSelectedToEdit(expense);
		setEditModalOpen(true);
	};

	const handleEditClose = () => {
		setSelectedToEdit(null);
		setEditModalOpen(false);
	};

	const handleDelete = async (id) => {
		const confirm = window.confirm("¿Estás seguro de eliminar este gasto?");
		if (!confirm) return;

		try {
			const response = await axios.delete(
				`http://localhost:5000/admin/expense/delete/${id}`,
				{
					headers: { tokenapp: Cookies.get("token") },
				},
			);
			if (response.data?.result) {
				setExpenses((prev) => prev.filter((e) => e.exp_id !== id));
			} else {
				alert("No se pudo eliminar el gasto.");
			}
		} catch {
			alert("Error al eliminar el gasto.");
		}
	};

	const handleChangePage = (_, newPage) => setPage(newPage);
	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleFilterClick = () => {
		if (startDate && endDate) fetchExpenses(startDate, endDate);
	};

	const handleShowAllClick = () => {
		setStartDate("");
		setEndDate("");
		if (data?.data) {
			setExpenses(data.data);
		} else {
			setExpenses([]);
		}
		setError(null);
		setPage(0);
	};

	const handleUpdated = () => {
		refetch();
		if (data?.data) setExpenses(data.data);
	};

	const errorDisplay = error || errorFetch;

	return (
		<Box p={2}>
			<Typography variant="h5" mb={2}>
				Reporte de Gastos por Rango de Fechas
			</Typography>

			<Box display="flex" gap={2} mb={2} flexWrap="wrap">
				<TextField
					label="Desde"
					type="date"
					value={startDate}
					onChange={(e) => setStartDate(e.target.value)}
					InputLabelProps={{ shrink: true }}
				/>
				<TextField
					label="Hasta"
					type="date"
					value={endDate}
					onChange={(e) => setEndDate(e.target.value)}
					InputLabelProps={{ shrink: true }}
				/>
				<Button
					variant="contained"
					onClick={handleFilterClick}
					disabled={!startDate || !endDate}
				>
					Filtrar
				</Button>
				<Button variant="outlined" onClick={handleShowAllClick}>
					Mostrar todos
				</Button>
			</Box>

			{errorDisplay && (
				<Typography color="error" mb={2}>
					{errorDisplay}
				</Typography>
			)}

			<Paper variant="outlined">
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>ID</TableCell>
								<TableCell>Tipo</TableCell>
								<TableCell>Método</TableCell>
								<TableCell>Descripción</TableCell>
								<TableCell>Monto</TableCell>
								<TableCell>Fecha</TableCell>
								<TableCell>Acciones</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{(rowsPerPage > 0
								? expenses.slice(
										page * rowsPerPage,
										page * rowsPerPage + rowsPerPage,
									)
								: expenses
							).map((row) => (
								<TableRow key={row.exp_id}>
									<TableCell>{row.exp_id}</TableCell>
									<TableCell>{row.ext_name}</TableCell>
									<TableCell>{row.pme_name}</TableCell>
									<TableCell>
										{row.exp_description || "Sin descripción"}
									</TableCell>
									<TableCell>${row.exp_amount.toFixed(2)}</TableCell>
									<TableCell>{row.date_expense}</TableCell>
									<TableCell>
										<IconButton
											color="primary"
											onClick={() => handleEditOpen(row)}
										>
											<EditOutlined />
										</IconButton>
										<IconButton
											color="error"
											onClick={() => handleDelete(row.exp_id)}
										>
											<DeleteOutlined />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
							{expenses.length === 0 && (
								<TableRow>
									<TableCell colSpan={7} align="center">
										No hay gastos para el rango seleccionado.
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
									count={expenses.length}
									rowsPerPage={rowsPerPage}
									page={page}
									onPageChange={handleChangePage}
									onRowsPerPageChange={handleChangeRowsPerPage}
									ActionsComponent={TablePaginationActions}
									colSpan={7}
								/>
							</TableRow>
						</TableFooter>
					</Table>
				</TableContainer>
			</Paper>

			<EditExpenseModal
				open={editModalOpen}
				onClose={handleEditClose}
				expense={selectedToEdit}
				onUpdated={handleUpdated}
			/>
		</Box>
	);
};

export default ExpenseReport;
