import React, { useEffect, useState } from "react";
import {
	Modal,
	Box,
	Grid,
	Button,
	Snackbar,
	Alert,
	FormControl,
	Autocomplete,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useFetch } from "../../../../hooks/useFetch";
import { useAuth } from "../../../../context/AuthContext";
import { updateExpense } from "../../../../services/admin/expenseService";
import CustomFormLabel from "../../../../components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "../../../../components/forms/theme-elements/CustomTextField";

const style = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: "90%",
	maxWidth: 500,
	bgcolor: "background.paper",
	boxShadow: 24,
	p: 4,
	borderRadius: 2,
};

const EditExpenseModal = ({ open, onClose, expense, onUpdated }) => {
	const {
		register,
		handleSubmit,
		reset,
		control,
		formState: { errors },
	} = useForm();
	const { user } = useAuth();
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [snackbarSeverity, setSnackbarSeverity] = useState("success");

	const { data: expenseTypesData } = useFetch(
		"http://localhost:5000/admin/ExpenseType/list",
	);
	const { data: methodData } = useFetch(
		"http://localhost:5000/admin/payment_method/list",
	);

	const expenseTypes = Array.isArray(expenseTypesData?.data)
		? expenseTypesData.data
		: [];
	const methodPayments = Array.isArray(methodData?.data?.data)
		? methodData.data.data
		: [];

	useEffect(() => {
		if (expense) {
			reset({
				ext_id:
					expenseTypes.find((t) => t.ext_name === expense.ext_name) || null,
				pme_id:
					methodPayments.find((m) => m.pme_name === expense.pme_name) || null,
				exp_description: expense.exp_description || "",
				exp_amount: expense.exp_amount || "",
			});
		}
	}, [expense, reset, expenseTypes, methodPayments]);

	const onSubmit = async (data) => {
		try {
			const expDateISO = expense.exp_date
				? new Date(expense.exp_date).toISOString()
				: new Date().toISOString();
			const payload = {
				exp_id: expense.exp_id,
				exp_type_id: data.ext_id?.ext_id,
				exp_payment_method_id: data.pme_id?.pme_id,
				exp_description: data.exp_description,
				exp_date: expDateISO,
				exp_amount: parseFloat(data.exp_amount),
				exp_receipt_number: expense.exp_receipt_number || "",
				user_created: user.user.user_login_id,
			};

			const response = await updateExpense(payload);

			if (response.result) {
				setSnackbarMessage("Gasto actualizado con éxito");
				setSnackbarSeverity("success");
				setSnackbarOpen(true);
				onUpdated();
				onClose();
			} else {
				throw new Error(response?.message || "Error al actualizar");
			}
		} catch (error) {
			setSnackbarMessage(error.message);
			setSnackbarSeverity("error");
			setSnackbarOpen(true);
		}
	};

	return (
		<>
			<Modal open={open} onClose={onClose}>
				<Box sx={style}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<Grid container spacing={2}>
							<Grid item xs={12} sm={6}>
								<CustomFormLabel>Tipo de Gasto</CustomFormLabel>
								<FormControl fullWidth error={!!errors.ext_id}>
									<Controller
										name="ext_id"
										control={control}
										rules={{ required: true }}
										render={({ field }) => (
											<Autocomplete
												options={expenseTypes}
												getOptionLabel={(option) => option.ext_name ?? ""}
												isOptionEqualToValue={(opt, val) =>
													opt.ext_id === val?.ext_id
												}
												onChange={(_, newValue) => field.onChange(newValue)}
												value={field.value}
												renderInput={(params) => (
													<CustomTextField
														{...params}
														error={!!errors.ext_id}
														helperText={errors.ext_id && "Campo requerido"}
													/>
												)}
											/>
										)}
									/>
								</FormControl>
							</Grid>

							<Grid item xs={12} sm={6}>
								<CustomFormLabel>Método de Pago</CustomFormLabel>
								<FormControl fullWidth error={!!errors.pme_id}>
									<Controller
										name="pme_id"
										control={control}
										rules={{ required: true }}
										render={({ field }) => (
											<Autocomplete
												options={methodPayments}
												getOptionLabel={(option) => option.pme_name ?? ""}
												isOptionEqualToValue={(opt, val) =>
													opt.pme_id === val?.pme_id
												}
												onChange={(_, newValue) => field.onChange(newValue)}
												value={field.value}
												renderInput={(params) => (
													<CustomTextField
														{...params}
														error={!!errors.pme_id}
														helperText={errors.pme_id && "Campo requerido"}
													/>
												)}
											/>
										)}
									/>
								</FormControl>
							</Grid>

							<Grid item xs={12}>
								<CustomFormLabel>Descripción</CustomFormLabel>
								<CustomTextField
									fullWidth
									{...register("exp_description", {
										required: "Campo requerido",
									})}
									error={!!errors.exp_description}
									helperText={errors.exp_description?.message}
								/>
							</Grid>

							<Grid item xs={12}>
								<CustomFormLabel>Monto</CustomFormLabel>
								<Controller
									name="exp_amount"
									control={control}
									rules={{
										required: "Campo requerido",
										min: { value: 0, message: "Debe ser positivo" },
										validate: (value) =>
											!Number.isNaN(parseFloat(value)) ||
											"Introduce un valor numérico válido",
									}}
									render={({ field }) => (
										<CustomTextField
											fullWidth
											type="number"
											inputProps={{ step: "0.01" }}
											{...field}
											value={field.value ?? ""}
											error={!!errors.exp_amount}
											helperText={errors.exp_amount?.message}
										/>
									)}
								/>
							</Grid>

							<Grid
								item
								xs={12}
								display="flex"
								justifyContent="flex-end"
								gap={1}
							>
								<Button onClick={onClose}>Cancelar</Button>
								<Button type="submit" variant="contained">
									Guardar
								</Button>
							</Grid>
						</Grid>
					</form>
				</Box>
			</Modal>

			<Snackbar
				open={snackbarOpen}
				autoHideDuration={3000}
				onClose={() => setSnackbarOpen(false)}
			>
				<Alert
					severity={snackbarSeverity}
					onClose={() => setSnackbarOpen(false)}
					sx={{ width: "100%" }}
				>
					{snackbarMessage}
				</Alert>
			</Snackbar>
		</>
	);
};

export default EditExpenseModal;
