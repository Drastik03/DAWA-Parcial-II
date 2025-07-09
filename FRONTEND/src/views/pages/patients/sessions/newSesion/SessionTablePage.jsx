import React, { useEffect, useState } from "react";
import {
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Button,
	Box,
	IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import SessionForm from "./SessionForm";

const API_BASE = "http://localhost:5000";

export default function SessionTablePage() {
	const [sessions, setSessions] = useState([]);
	const [inventarios, setInventarios] = useState([]);
	const [productos, setProductos] = useState([]);
	const [tiposSesion, setTiposSesion] = useState([]);
	const [personalMedico, setPersonalMedico] = useState([]);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [modalOpen, setModalOpen] = useState(false);
	const [editSession, setEditSession] = useState(null);

	const fetchAllData = () => {
		const tokenapp = Cookies.get("token");
		setLoading(true);
		setError(null);

		Promise.all([
			axios.get(`${API_BASE}/clinic/TherapySession/list`, {
				headers: { tokenapp },
			}),
			axios.get(`${API_BASE}/admin/invoice/list`, { headers: { tokenapp } }),
			axios.get(`${API_BASE}/admin/product/list`, { headers: { tokenapp } }),
			axios.get(`${API_BASE}/admin/therapy-type/list`, {
				headers: { tokenapp },
			}),
			axios.get(`${API_BASE}/admin/Medical_staff/list`, {
				headers: { tokenapp },
			}),
		])
			.then(([sessionsRes, invRes, prodRes, typRes, medRes]) => {
				setSessions(
					Array.isArray(sessionsRes.data?.data) ? sessionsRes.data.data : [],
				);
				setInventarios(
					Array.isArray(invRes.data?.data) ? invRes.data.data : [],
				);
				setProductos(
					Array.isArray(prodRes?.data.data?.data) ? prodRes.data.data.data : [],
				);
				setTiposSesion(
					Array.isArray(typRes?.data.data.data) ? typRes.data.data.data : [],
				);
				setPersonalMedico(
					Array.isArray(medRes?.data.data?.data) ? medRes.data.data.data : [],
				);
			})
			.catch((e) => {
				console.error(e);
				setError("Error cargando datos.");
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		fetchAllData();
	}, []);

	const handleEdit = (session) => {
		setEditSession(session);
		setModalOpen(true);
	};

	const handleDelete = async (sessionId) => {
		if (!window.confirm("¿Seguro que desea eliminar esta sesión?")) return;

		try {
			const tokenapp = Cookies.get("token");
			const res = await axios.delete(
				`${API_BASE}/clinic/TherapySession/delete/${sessionId}`,
				{ headers: { tokenapp } },
			);
			if (res.data.result) {
				fetchAllData();
			} else {
				alert("Error eliminando sesión: " + res.data.message);
			}
		} catch (error) {
			alert("Error en la conexión al eliminar");
			console.error(error);
		}
	};

	const handleCloseModal = () => {
		setModalOpen(false);
		setEditSession(null);
	};

	return (
		<Box p={2}>
			<Typography variant="h4" gutterBottom>
				Listado de Sesiones
			</Typography>
			<Button
				variant="contained"
				onClick={() => {
					setEditSession(null);
					setModalOpen(true);
				}}
				sx={{ mb: 2 }}
			>
				Crear Sesión
			</Button>

			{error && (
				<Typography color="error" mb={2}>
					{error}
				</Typography>
			)}

			<TableContainer component={Paper}>
				<Table stickyHeader size="small">
					<TableHead>
						<TableRow>
							<TableCell>ID</TableCell>
							<TableCell>Número Sesión</TableCell>
							<TableCell>Factura # / Cliente</TableCell>
							<TableCell>Producto</TableCell>
							<TableCell>Tipo Terapia</TableCell>
							<TableCell>Personal Médico</TableCell>
							<TableCell>Consumida</TableCell>
							<TableCell>Estado</TableCell>
							<TableCell>Acciones</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{sessions.length === 0 ? (
							<TableRow>
								<TableCell colSpan={9} align="center">
									No hay sesiones registradas
								</TableCell>
							</TableRow>
						) : (
							sessions.map((ses) => (
								<TableRow key={ses.sec_id}>
									<TableCell>{ses.sec_id}</TableCell>
									<TableCell>{ses.sec_ses_number}</TableCell>
									<TableCell>
										{ses.inv_number}{" "}
										{ses.full_name || ses.client_name
											? ` / ${ses.full_name || ses.client_name}`
											: ""}
									</TableCell>
									<TableCell>{ses.pro_name || "N/A"}</TableCell>
									<TableCell>{ses.tht_name || "N/A"}</TableCell>
									<TableCell>
										{ses.person_names
											? `${ses.person_names} ${ses.person_surnames}`
											: "N/A"}
									</TableCell>
									<TableCell>{ses.ses_consumed ? "Sí" : "No"}</TableCell>
									<TableCell>{ses.ses_state ? "Activo" : "Inactivo"}</TableCell>
									<TableCell>
										<IconButton
											size="small"
											color="primary"
											onClick={() => handleEdit(ses)}
										>
											<Edit fontSize="small" />
										</IconButton>
										<IconButton
											size="small"
											color="error"
											onClick={() => handleDelete(ses.sec_id)}
										>
											<Delete fontSize="small" />
										</IconButton>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<SessionForm
				open={modalOpen}
				onClose={handleCloseModal}
				inventarios={inventarios}
				productos={productos}
				tiposSesion={tiposSesion}
				personalMedico={personalMedico}
				onCreated={fetchAllData}
				editSession={editSession}
			/>
		</Box>
	);
}
