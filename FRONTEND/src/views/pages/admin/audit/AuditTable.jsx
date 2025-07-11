import React, { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableFooter,
	TableHead,
	TablePagination,
	TableRow,
	Paper,
	Box,
	IconButton,
	Collapse,
	Typography,
	Alert,
	TextField,
} from "@mui/material";
import {
	KeyboardArrowDown,
	KeyboardArrowUp,
	FirstPage,
	LastPage,
	KeyboardArrowLeft,
	KeyboardArrowRight,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import ParentCard from "../../../../components/shared/ParentCard";
import PageContainer from "../../../../components/container/PageContainer";
import Breadcrumb from "../../../../layouts/full/shared/breadcrumb/Breadcrumb";
import { useFetch } from "../../../../hooks/useFetch";

const TablePaginationActions = (props) => {
	const theme = useTheme();
	const { count, page, rowsPerPage, onPageChange } = props;

	return (
		<Box sx={{ flexShrink: 0, ml: 2.5 }}>
			<IconButton onClick={(e) => onPageChange(e, 0)} disabled={page === 0}>
				{theme.direction === "rtl" ? <LastPage /> : <FirstPage />}
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
				{theme.direction === "rtl" ? <FirstPage /> : <LastPage />}
			</IconButton>
		</Box>
	);
};

const BCrumb = [{ to: "/", title: "Home" }, { title: "Auditoría" }];

const AuditPaginationTable = () => {
	const { data, error } = useFetch(
		`${import.meta.env.VITE_API_URL}/Audit/list`,
	);
	const rows = Array.isArray(data) ? data : [];

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [expandedRowId, setExpandedRowId] = useState(null);

	const [filterAction, setFilterAction] = useState("");

	const handleChangePage = (event, newPage) => setPage(newPage);
	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleToggleExpand = (id) => {
		setExpandedRowId((prev) => (prev === id ? null : id));
	};

	const handleFilterChange = (event) => {
		setFilterAction(event.target.value);
		setPage(0);
	};

	const filteredRows = rows.filter((row) =>
		row.sql_command.toLowerCase().includes(filterAction.toLowerCase()),
	);

	const emptyRows =
		rowsPerPage > 0
			? Math.max(0, (1 + page) * rowsPerPage - filteredRows.length)
			: 0;

	return (
		<PageContainer
			title="Auditoría"
			description="Registro de eventos del sistema"
		>
			<Breadcrumb title="Auditoría" items={BCrumb} />
			<ParentCard title="Eventos de Auditoría">
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						Error al cargar auditoría: {error.message}
					</Alert>
				)}

				<Box sx={{ mb: 2 }}>
					<TextField
						label="Filtrar por Acción"
						variant="outlined"
						size="small"
						value={filterAction}
						onChange={handleFilterChange}
						fullWidth
					/>
				</Box>

				<Paper variant="outlined">
					<TableContainer>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell />
									<TableCell>
										<Typography fontWeight={600}>Tabla</Typography>
									</TableCell>
									<TableCell>
										<Typography fontWeight={600}>Acción</Typography>
									</TableCell>
									<TableCell>
										<Typography fontWeight={600}>Usuario</Typography>
									</TableCell>
									<TableCell>
										<Typography fontWeight={600}>Fecha</Typography>
									</TableCell>
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
									<React.Fragment key={row.id}>
										<TableRow hover>
											<TableCell>
												<IconButton
													size="small"
													onClick={() => handleToggleExpand(row.id)}
												>
													{expandedRowId === row.id ? (
														<KeyboardArrowUp />
													) : (
														<KeyboardArrowDown />
													)}
												</IconButton>
											</TableCell>
											<TableCell>{row.table_name}</TableCell>
											<TableCell>{row.sql_command}</TableCell>
											<TableCell>{row.user_name}</TableCell>
											<TableCell>
												{new Date(row.date_event).toLocaleString("es-EC")}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell
												style={{ paddingBottom: 0, paddingTop: 0 }}
												colSpan={6}
											>
												<Collapse
													in={expandedRowId === row.id}
													timeout="auto"
													unmountOnExit
												>
													<Box
														sx={{
															margin: 1,
															bgcolor: "#f7f7f7",
															p: 2,
															borderRadius: 2,
														}}
													>
														{row.new_record && (
															<>
																<Typography variant="subtitle2">
																	Nuevo Registro:
																</Typography>
																<pre style={{ fontSize: 13 }}>
																	{JSON.stringify(row.new_record, null, 2)}
																</pre>
															</>
														)}
														{row.old_record && (
															<>
																<Typography variant="subtitle2" sx={{ mt: 2 }}>
																	Registro Anterior:
																</Typography>
																<pre style={{ fontSize: 13 }}>
																	{JSON.stringify(row.old_record, null, 2)}
																</pre>
															</>
														)}
													</Box>
												</Collapse>
											</TableCell>
										</TableRow>
									</React.Fragment>
								))}
								{emptyRows > 0 && (
									<TableRow style={{ height: 53 * emptyRows }}>
										<TableCell colSpan={6} />
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
										count={filteredRows.length}
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
			</ParentCard>
		</PageContainer>
	);
};

export default AuditPaginationTable;
