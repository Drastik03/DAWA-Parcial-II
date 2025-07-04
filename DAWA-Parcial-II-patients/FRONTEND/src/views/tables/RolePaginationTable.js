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
    Alert,
} from "@mui/material";

import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";

import Breadcrumb from "../../layouts/full/shared/breadcrumb/Breadcrumb";
import PageContainer from "../../components/container/PageContainer";
import ParentCard from "../../components/shared/ParentCard";

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
                {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
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
        title: "Roles Pagination Table",
    },
];

const rolesData = [
    {
        rol_id: 4,
        rol_name: "Asesor",
        rol_description: "Quién  gestiona el curso dentro del aula virtual",
    },
    {
        rol_id: 5,
        rol_name: "Auditor",
        rol_description: "Gestiona la auditoría del sistema",
    },
    {
        rol_id: 1,
        rol_name: "Administrador",
        rol_description: "Administrador del Sistema",
    },
    {
        rol_id: 6,
        rol_name: "Co-Evaluador",
        rol_description: "Co-evaluador Pares académicos",
    },
    {
        rol_id: 2,
        rol_name: "Docente",
        rol_description: "Quien ejecuta el proceso de auto-evaluación",
    },
    {
        rol_id: 8,
        rol_name: "Recomendaciones",
        rol_description: "Encargado del modulo de recomendaciones",
    },
    {
        rol_id: 3,
        rol_name: "Gestor",
        rol_description: "Administrador del proceso de evaluación",
    },
];

const RolePaginationTable = () => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [alertOpen, setAlertOpen] = React.useState(false);
    const [alertMessage, setAlertMessage] = React.useState("");
    const [alertSeverity, setAlertSeverity] = React.useState("success");

    const rows = rolesData;
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
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

    return (
        <PageContainer title="Roles" description="Tabla de roles con paginación">
            <Breadcrumb title="Roles" items={BCrumb} />
            <ParentCard title="Roles Registrados">
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
                        <Table aria-label="custom pagination table" sx={{ whiteSpace: "nowrap" }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <Typography variant="h6">ID</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="h6">Nombre</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="h6">Descripción</Typography>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(rowsPerPage > 0
                                    ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    : rows
                                ).map((row) => (
                                    <TableRow key={row.rol_id}>
                                        <TableCell>{row.rol_id}</TableCell>
                                        <TableCell>{row.rol_name}</TableCell>
                                        <TableCell>{row.rol_description}</TableCell>
                                    </TableRow>
                                ))}
                                {emptyRows > 0 && (
                                    <TableRow style={{ height: 53 * emptyRows }}>
                                        <TableCell colSpan={3} />
                                    </TableRow>
                                )}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TablePagination
                                        rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                                        colSpan={3}
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
    );
};

export default RolePaginationTable;