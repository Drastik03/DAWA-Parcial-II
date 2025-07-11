import React, { useRef } from "react";
import {
	Box,
	Card,
	CardContent,
	CardHeader,
	Divider,
	Grid,
	Typography,
	CircularProgress,
	Button,
	Stack,
} from "@mui/material";
import {
	Person,
	MedicalServices,
	ContactPhone,
	CalendarToday,
	Print,
} from "@mui/icons-material";
import { useFetch } from "../../../../hooks/useFetch";
import { useReactToPrint } from "react-to-print";

const PatientMedicalHistory = () => {
	const { data, loading } = useFetch(
		`${import.meta.env.VITE_API_URL}/clinic/patients/list`,
	);

	const patient = data?.[0];

	const componentRef = useRef();

	const handlePrint = useReactToPrint({
		content: () => componentRef.current,
		documentTitle: `Historial_Medico_${patient?.pat_code || ""}`,
	});

	if (loading) {
		return (
			<Box display="flex" justifyContent="center" mt={10}>
				<CircularProgress />
			</Box>
		);
	}

	if (!patient) {
		return (
			<Box p={3}>
				<Typography color="error">
					No se pudo cargar el historial médico.
				</Typography>
			</Box>
		);
	}

	return (
		<Box p={3}>
			<Stack direction="row" justifyContent="flex-end" mb={2}>
				<Button
					variant="outlined"
					startIcon={<Print />}
					onClick={handlePrint}
					color="primary"
				>
					Imprimir
				</Button>
			</Stack>

			<div ref={componentRef}>
				<Card>
					<CardHeader
						avatar={<MedicalServices color="primary" />}
						title={
							<Typography variant="h6">
								Historial Médico - {patient.per_names} {patient.per_surnames}
							</Typography>
						}
						subheader={`Código: ${patient.pat_code}`}
					/>
					<Divider />
					<CardContent>
						{/* Información Personal */}
						<Typography variant="subtitle1" gutterBottom>
							<Person fontSize="small" sx={{ mr: 1 }} />
							Información Personal
						</Typography>
						<Grid container spacing={2}>
							<Grid item xs={12} sm={6}>
								<Typography>
									<strong>Cédula:</strong> {patient.per_identification}
								</Typography>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Typography>
									<strong>Género:</strong>{" "}
									{patient.per_genre_id === 1 ? "Masculino" : "Femenino"}
								</Typography>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Typography>
									<strong>Fecha de Nacimiento:</strong> {patient.per_birth_date}
								</Typography>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Typography>
									<strong>Estado Civil:</strong> {patient.per_marital_status_id}
								</Typography>
							</Grid>
						</Grid>

						<Divider sx={{ my: 2 }} />

						{/* Contacto */}
						<Typography variant="subtitle1" gutterBottom>
							<ContactPhone fontSize="small" sx={{ mr: 1 }} />
							Contacto
						</Typography>
						<Grid container spacing={2}>
							<Grid item xs={12} sm={6}>
								<Typography>
									<strong>Teléfono:</strong> {patient.per_phone}
								</Typography>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Typography>
									<strong>Correo:</strong> {patient.per_mail}
								</Typography>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Typography>
									<strong>País:</strong> {patient.per_country}
								</Typography>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Typography>
									<strong>Ciudad:</strong> {patient.per_city}
								</Typography>
							</Grid>
							<Grid item xs={12}>
								<Typography>
									<strong>Dirección:</strong> {patient.per_address}
								</Typography>
							</Grid>
						</Grid>

						<Divider sx={{ my: 2 }} />

						{/* Historial Médico */}
						<Typography variant="subtitle1" gutterBottom>
							<MedicalServices fontSize="small" sx={{ mr: 1 }} />
							Historial Médico
						</Typography>
						<Grid container spacing={2}>
							<Grid item xs={12} sm={6}>
								<Typography>
									<strong>Tipo de Sangre:</strong> {patient.pat_blood_type}
								</Typography>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Typography>
									<strong>Condiciones Médicas:</strong>{" "}
									{patient.pat_medical_conditions}
								</Typography>
							</Grid>
							<Grid item xs={12}>
								<Typography>
									<strong>Alergias:</strong> {patient.pat_allergies}
								</Typography>
							</Grid>
						</Grid>

						<Divider sx={{ my: 2 }} />

						{/* Contacto de Emergencia */}
						<Typography variant="subtitle1" gutterBottom>
							<ContactPhone fontSize="small" sx={{ mr: 1 }} />
							Contacto de Emergencia
						</Typography>
						<Grid container spacing={2}>
							<Grid item xs={12} sm={6}>
								<Typography>
									<strong>Nombre:</strong> {patient.pat_emergency_contact_name}
								</Typography>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Typography>
									<strong>Teléfono:</strong>{" "}
									{patient.pat_emergency_contact_phone}
								</Typography>
							</Grid>
						</Grid>

						<Divider sx={{ my: 2 }} />

						{/* Registro */}
						<Typography variant="subtitle1" gutterBottom>
							<CalendarToday fontSize="small" sx={{ mr: 1 }} />
							Registro
						</Typography>
						<Grid container spacing={2}>
							<Grid item xs={12} sm={6}>
								<Typography>
									<strong>Fecha de Creación:</strong> {patient.date_created}
								</Typography>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Typography>
									<strong>Creado por:</strong> {patient.user_created}
								</Typography>
							</Grid>
						</Grid>
					</CardContent>
				</Card>
			</div>
		</Box>
	);
};

export default PatientMedicalHistory;
