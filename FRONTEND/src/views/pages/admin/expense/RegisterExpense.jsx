/** biome-ignore-all lint/nursery/useUniqueElementIds: <explanation> */
/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */
import React, { useState } from "react";
import { Grid, Box, Button, FormControl, Snackbar, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import CustomTextField from "../../../../components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "../../../../components/forms/theme-elements/CustomFormLabel";
import ParentCard from "../../../../components/shared/ParentCard";
import Breadcrumb from "../../../../layouts/full/shared/breadcrumb/Breadcrumb";
import PageContainer from "../../../../components/container/PageContainer";
import { createExpense } from "../../../../services/admin/expenseService";
import { useFetch } from "../../../../hooks/useFetch";

const BCrumb = [
	{
		to: "/",
		title: "Home",
	},
	{
		title: "Registrar Gasto",
	},
];

const FormExpenseRegister = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm();

	const [openSnackbar, setOpenSnackbar] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState("success");
	const { data } = useFetch("http://localhost:5000/admin/ExpenseType/list");
	console.log(data);
	

	const registerExpense = async (data) => {
		try {
			const payload = {
				ext_name: data.ext_name,
				pme_name: data.pme_name,
				date_expense: data.date_expense,
				exp_amount: parseFloat(data.exp_amount),
				exp_description: data.exp_description,
				exp_receipt_number: data.exp_receipt_number,
			};
			const res = await createExpense(payload);
			if (res.result) {
				setSnackbarMessage("Gasto registrado exitosamente");
				setSnackbarSeverity("success");
				setOpenSnackbar(true);
				reset();
			} else {
				throw new Error(res.message);
			}
		} catch (error) {
			setSnackbarMessage(`Error: ${error.message}`);
			setSnackbarSeverity("error");
			setOpenSnackbar(true);
		}
	};

	return (
		<PageContainer
			title="Creación de Gasto"
			description="Formulario para registrar un nuevo gasto"
		>
			<Breadcrumb title="Gastos" items={BCrumb} />
			<ParentCard
				title="Registro de Gasto"
				footer={
					<>
						<Button
							variant="contained"
							color="error"
							sx={{ mr: 1 }}
							onClick={() => reset()}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							variant="contained"
							color="primary"
							form="expense-form"
						>
							Registrar
						</Button>
					</>
				}
			>
				<Box
					component="form"
					id="expense-form"
					onSubmit={handleSubmit(registerExpense)}
					noValidate
				>
					<Grid container spacing={3} mb={3}>
						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Tipo de Gasto</CustomFormLabel>
							<CustomTextField
								fullWidth
								{...register("ext_name", { required: true })}
								error={!!errors.ext_name}
								helperText={errors.ext_name && "Campo requerido"}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Método de Pago</CustomFormLabel>
							<CustomTextField
								fullWidth
								{...register("pme_name", { required: true })}
								error={!!errors.pme_name}
								helperText={errors.pme_name && "Campo requerido"}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Fecha del Gasto</CustomFormLabel>
							<CustomTextField
								fullWidth
								type="datetime-local"
								{...register("date_expense", { required: true })}
								error={!!errors.date_expense}
								helperText={errors.date_expense && "Campo requerido"}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Monto</CustomFormLabel>
							<CustomTextField
								fullWidth
								type="number"
								inputProps={{ step: "0.01" }}
								{...register("exp_amount", { required: true })}
								error={!!errors.exp_amount}
								helperText={errors.exp_amount && "Campo requerido"}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<CustomFormLabel>Número de Comprobante</CustomFormLabel>
							<CustomTextField
								fullWidth
								{...register("exp_receipt_number", { required: true })}
								error={!!errors.exp_receipt_number}
								helperText={errors.exp_receipt_number && "Campo requerido"}
							/>
						</Grid>

						<Grid item xs={12}>
							<CustomFormLabel>Descripción</CustomFormLabel>
							<CustomTextField
								fullWidth
								multiline
								rows={3}
								{...register("exp_description")}
							/>
						</Grid>
					</Grid>
				</Box>

				<Snackbar
					open={openSnackbar}
					autoHideDuration={5000}
					onClose={() => setOpenSnackbar(false)}
					anchorOrigin={{ vertical: "top", horizontal: "center" }}
				>
					<Alert
						onClose={() => setOpenSnackbar(false)}
						severity={snackbarSeverity}
						variant="filled"
						sx={{ width: "100%" }}
					>
						{snackbarMessage}
					</Alert>
				</Snackbar>
			</ParentCard>
		</PageContainer>
	);
};

export default FormExpenseRegister;
