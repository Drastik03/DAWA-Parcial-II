import React, { useEffect, useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	TablePagination,
	CircularProgress,
	Typography,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE = import.meta.env.VITE_API_URL;

const PatientDiseaseTable = ({ patientId, refresh }) => {
	const [diseases, setDiseases] = useState([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(0); 
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [totalCount, setTotalCount] = useState(0);

	const fetchDiseases = async (page, rowsPerPage) => {
		setLoading(true);
		try {
			const res = await axios.get(
				`${API_BASE}/clinic/patient-disease/get/${patientId}`,
				{
					headers: { tokenapp: Cookies.get("token") },
					params: {
						page: page + 1, 
						limit: rowsPerPage,
					},
				},
			);
			if (res.data.result) {
				setDiseases(res.data.data.items || res.data.data); 
				setTotalCount(res.data.data.total || res.data.data.length);
			} else {
				setDiseases([]);
				setTotalCount(0);
			}
		} catch (error) {
			setDiseases([]);
			setTotalCount(0);
		}
		setLoading(false);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		fetchDiseases(page, rowsPerPage);
	}, [patientId, page, rowsPerPage, refresh]);

	const handleChangePage = (_, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0); 
	};

	if (loading) {
		return (
			<Paper sx={{ p: 2, textAlign: "center" }}>
				<CircularProgress />
			</Paper>
		);
	}

	if (diseases.length === 0) {
		return (
			<Typography sx={{ m: 2 }} align="center">
				No hay enfermedades registradas.
			</Typography>
		);
	}

	return (
		<Paper>
			<TableContainer>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>ID</TableCell>
							<TableCell>Enfermedad</TableCell>
							<TableCell>Actual</TableCell>
							<TableCell>Notas</TableCell>
							<TableCell>Usuario</TableCell>
							<TableCell>Fecha</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{diseases.map((disease) => (
							<TableRow key={disease.pd_id}>
								<TableCell>{disease.pd_id}</TableCell>
								<TableCell>{disease.disease_name}</TableCell>
								<TableCell>{disease.pd_is_current ? "Sí" : "No"}</TableCell>
								<TableCell>{disease.pd_notes}</TableCell>
								<TableCell>{disease.user_created}</TableCell>
								<TableCell>{disease.date_created}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			<TablePagination
				component="div"
				count={totalCount}
				page={page}
				onPageChange={handleChangePage}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				rowsPerPageOptions={[5, 10, 25]}
			/>
		</Paper>
	);
};

export default PatientDiseaseTable;
