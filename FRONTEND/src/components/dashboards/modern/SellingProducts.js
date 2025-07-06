import React from "react";
import {
	Box,
	CardContent,
	Chip,
	Paper,
	Stack,
	Typography,
	LinearProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SavingsImg from "../../../assets/images/backgrounds/piggy.png";

const SellingProducts = ({ data }) => {
	const theme = useTheme();
	const secondarylight = theme.palette.secondary.light;
	const primarylight = theme.palette.primary.light;
	const secondary = theme.palette.secondary.main;
	const primary = theme.palette.primary.main;
	const borderColor = theme.palette.grey[100];
	const total = (data?.total_earnings ?? 0) + (data?.total_expenses ?? 0);
	const earningsPercent =
		total === 0 ? 0 : ((data?.total_earnings ?? 0) / total) * 100;
	const expensesPercent =
		total === 0 ? 0 : ((data?.total_expenses ?? 0) / total) * 100;

	const sells = [
		{
			product: "Ganancias totales",
			price: data?.total_earnings ?? 0,
			percent: Math.round(earningsPercent),
			color: "primary",
		},
		{
			product: "Gastos totales",
			price: data?.total_expenses ?? 0,
			percent: Math.round(expensesPercent),
			color: "secondary",
		},
	];

	return (
		<Paper
			sx={{ bgcolor: "primary.main", border: `1px solid ${borderColor}` }}
			variant="outlined"
		>
			<CardContent>
				<Typography variant="h5" color="white">
					Resumen financiero
				</Typography>
				<Typography variant="subtitle1" color="white" mb={4}>
					Visión general 2025
				</Typography>

				<Box textAlign="center" mt={2} mb="-90px">
					<img src={SavingsImg} alt="Savings" width={"300px"} />
				</Box>
			</CardContent>
			<Paper
				sx={{
					overflow: "hidden",
					zIndex: "1",
					position: "relative",
					margin: "10px",
				}}
			>
				<Box p={3}>
					<Stack spacing={3}>
						{sells.map((sell, i) => (
							<Box key={i}>
								<Stack
									direction="row"
									spacing={2}
									mb={1}
									justifyContent="space-between"
									alignItems="center"
								>
									<Box>
										<Typography variant="h6">{sell.product}</Typography>
										<Typography variant="subtitle2" color="textSecondary">
											$
											{sell.price.toLocaleString(undefined, {
												minimumFractionDigits: 2,
											})}
										</Typography>
									</Box>
									<Chip
										sx={{
											backgroundColor:
												sell.color === "primary"
													? primarylight
													: secondarylight,
											color: sell.color === "primary" ? primary : secondary,
											borderRadius: "4px",
											width: 55,
											height: 24,
										}}
										label={`${sell.percent}%`}
									/>
								</Stack>
								<LinearProgress
									value={sell.percent}
									variant="determinate"
									color={sell.color}
								/>
							</Box>
						))}
					</Stack>
				</Box>
			</Paper>
		</Paper>
	);
};

export default SellingProducts;
