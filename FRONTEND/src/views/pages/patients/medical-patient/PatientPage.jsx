import React, { useState } from "react";
import { Box, Typography, Divider } from "@mui/material";
import { PatientForm } from "./FormCreatePatient";
import { ClientsTable } from "./ClientsTable";
import { PersonsTable } from "../../admin/clients/PersonsTable";
import PatientsTable from "./PatientsTable";

const PatientsPage = () => {
	const [selectedPerson, setSelectedPerson] = useState(null);
	const [selectedClient, setSelectedClient] = useState(null);
	const [refreshPatients, setRefreshPatients] = useState(false);

	return (
		<Box p={3}>
			<Typography variant="h5" gutterBottom>
				Personas Registradas
			</Typography>
			<PersonsTable onSelectPerson={setSelectedPerson} />

			<Divider sx={{ my: 3 }} />

			<Typography variant="h5" gutterBottom>
				Clientes Registrados
			</Typography>
			<ClientsTable onSelectClient={setSelectedClient} />

			<Divider sx={{ my: 3 }} />

			<Typography variant="h5" gutterBottom>
				Registrar Paciente
			</Typography>
			<PatientForm
				selectedPerson={selectedPerson}
				selectedClient={selectedClient}
				onCreated={() => setRefreshPatients((r) => !r)}
			/>

			<Divider sx={{ my: 3 }} />

			<Typography variant="h5" gutterBottom>
				Pacientes Registrados
			</Typography>
			<PatientsTable key={refreshPatients} />
		</Box>
	);
};

export default PatientsPage;
