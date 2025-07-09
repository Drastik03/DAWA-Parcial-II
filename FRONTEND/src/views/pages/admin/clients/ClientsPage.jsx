import React, { useState } from "react";
import { PersonsTable } from "./PersonsTable";
import { ClientForm } from "./ClientForm";
import { ClientsTable } from "./ClientsTable";
import { Box, Typography, Divider } from "@mui/material";

const ClientsPage = () => {
	const [selectedPerson, setSelectedPerson] = useState(null);
	const [refreshClients, setRefreshClients] = useState(false);

	return (
		<Box p={3}>
			<Typography variant="h5" gutterBottom>
				Personas Registradas
			</Typography>
			<PersonsTable onSelectPerson={setSelectedPerson} />

			<Divider sx={{ my: 3 }} />

			<Typography variant="h5" gutterBottom>
				Agregar Cliente
			</Typography>
			<ClientForm
				selectedPerson={selectedPerson}
				onCreated={() => setRefreshClients((r) => !r)}
			/>

			<Divider sx={{ my: 3 }} />

			<Typography variant="h5" gutterBottom>
				Clientes Registrados
			</Typography>
			<ClientsTable key={refreshClients} />
		</Box>
	);
};

export default ClientsPage;
