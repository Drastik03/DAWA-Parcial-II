/* eslint-disable react/prop-types */
import * as React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import {
	Typography,
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
	Button,
	Alert,
} from "@mui/material";

import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";

import Breadcrumb from "../../layouts/full/shared/breadcrumb/Breadcrumb";
import PageContainer from "../../components/container/PageContainer";
import ParentCard from "../../components/shared/ParentCard";
import PersonRow from "../../components/admin/persons/PersonRows";
import { useNavigate } from "react-router-dom";
import Spinner from "../spinner/Spinner";
import { deletePersonById, editPerson } from "../../services/personsService";
import { useAuth } from "../../context/AuthContext";

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
		title: "Pagination Table",
	},
];

const PersonPaginationTable = ({
	title,
	description,
	header,
	list,
	error,
	loading,
	onRefresh,
}) => {
	const [page, setPage] = React.useState(0);
	// console.log("DESDE DATA PERSON
	const [alertOpen, setAlertOpen] = React.useState(false);
	const [alertMessage, setAlertMessage] = React.useState("");

	const [alertSeverity, setAlertSeverity] = React.useState("success");

	const [rowsPerPage, setRowsPerPage] = React.useState(5);
	const navigate = useNavigate();
	const { user } = useAuth();
	console.log("Usuario autenticado:", user.user.user_login_id);

	// Avoid a layout jump when reaching the last page with empty rows.
	// eslint-disable-next-line react/prop-types
	const rows = list?.data || [];
	const emptyRows =
		page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};
	React.useEffect(() => {
		if (alertOpen) {
			const timer = setTimeout(() => {
				setAlertOpen(false);
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [alertOpen]);

	const handleDeletePersonId = async (id) => {
		try {
			const data = await deletePersonById(id, user.user.user_login_id);
			console.log("Respuesta deletePersonById:", data);
			if (data?.result === true) {
				setAlertMessage("Persona eliminado con éxito");
				setAlertSeverity("success");
				setAlertOpen(true);
				onRefresh();
			} else {
				setAlertMessage("Error al eliminar el usuario");
				setAlertSeverity("error");
				setAlertOpen(true);
			}
		} catch (error) {
			console.error("Error al eliminar la persona:", error);
			setAlertMessage("Error al eliminar el persona");
			setAlertSeverity("error");
			setAlertOpen(true);
		}
	};
	const handleEditPerson = async (personData) => {
		try {
			const payload = {
				per_id: personData.per_id,
				per_name: personData.per_name,
				per_genre_id: Number(personData.per_genre_id), 
				user_process: user.user_login_id, 
			};

			const result = await editPerson(payload, user.token);

			if (result.result) {
				setAlertMessage("Persona editada con éxito");
				setAlertSeverity("success");
				setAlertOpen(true);
				onRefresh();
			} else {
				setAlertMessage("Error: " + result.message);
				setAlertSeverity("error");
				setAlertOpen(true);
			}
		} catch (error) {
			setAlertMessage("Error al editar a la persona");
			setAlertSeverity("error");
			setAlertOpen(true);
		}
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	return (
		<>
			<PageContainer title={title} description={description}>
				<Breadcrumb title={title} items={BCrumb} />
				<Button
					variant="contained"
					color="primary"
					startIcon={
						// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
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
						navigate("/admin/persons/create");
					}}
					sx={{ mb: 2, textTransform: "none", fontWeight: 600 }}
				>
					Crear Persona
				</Button>
				<ParentCard title="Personas Registradas">
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
										{
											// eslint-disable-next-line react/prop-types
											header?.map((item, index) => (
												// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
												<TableCell key={index}>
													<Typography variant="h6">{item}</Typography>
												</TableCell>
											))
										}
									</TableRow>
								</TableHead>
								<TableBody>
									{loading
										? <TableRow>
												<TableCell colSpan={8}>
													<Spinner />
												</TableCell>
											</TableRow>
										: error
											? <TableRow>
													<TableCell colSpan={8}>
														<Typography color="error" textAlign="center">
															No hay nada que mostrar
														</Typography>
													</TableCell>
												</TableRow>
											: (rowsPerPage > 0
													? rows.slice(
															page * rowsPerPage,
															page * rowsPerPage + rowsPerPage,
														)
													: rows
												).map((row) => (
													<PersonRow
														key={row.per_id}
														person={row}
														onEdit={(p) => handleEditPerson(p)}
														onDelete={(id) => handleDeletePersonId(id)}
													/>
												))}

									{emptyRows > 0 && (
										<TableRow style={{ height: 53 * emptyRows }}>
											<TableCell colSpan={8} />
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
											colSpan={8}
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
			</PageContainer>
		</>
	);
};

export default PersonPaginationTable;
