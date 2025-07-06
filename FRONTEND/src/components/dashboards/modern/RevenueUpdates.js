import React from "react";
import Chart from "react-apexcharts";
import { useTheme } from "@mui/material/styles";
import {
	MenuItem,
	Grid,
	Stack,
	Typography,
	Button,
	Avatar,
	Box,
} from "@mui/material";
import { IconGridDots } from "@tabler/icons";
import DashboardCard from "../../shared/DashboardCard";
import CustomSelect from "../../forms/theme-elements/CustomSelect";

const RevenueUpdates = ({ data }) => {
	const [month, setMonth] = React.useState("1");

	const handleChange = (event) => {
		setMonth(event.target.value);
	};

	const theme = useTheme();
	const primary = theme.palette.primary.main;
	const secondary = theme.palette.secondary.main;

	const seriescolumnchart = [
		{
			name: "Ingresos",
			data: [
				data?.total_2024 ?? 0,
				data?.total_2025 ?? 0,
				data?.earnings_mes ?? 0,
			],
		},
		{
			name: "Gastos",
			data: [
				0,
				0,
				data?.expenses_mes ?? 0,
			],
		},
	];

	const optionscolumnchart = {
		chart: {
			type: "bar",
			fontFamily: "'Plus Jakarta Sans', sans-serif;",
			foreColor: "#adb0bb",
			toolbar: {
				show: true,
			},
			height: 370,
			stacked: true,
		},
		colors: [primary, secondary],
		plotOptions: {
			bar: {
				horizontal: false,
				barHeight: "60%",
				columnWidth: "30%",
				borderRadius: 6,
			},
		},
		stroke: { show: false },
		dataLabels: {
			enabled: true,
			formatter: (val) => `$${val.toLocaleString()}`,
		},
		legend: { show: true },
		grid: {
			borderColor: "rgba(0,0,0,0.1)",
			strokeDashArray: 3,
			xaxis: { lines: { show: false } },
		},
		yaxis: {
			labels: {
				formatter: (val) => `$${val.toLocaleString()}`,
			},
		},
		xaxis: {
			categories: ["2024", "2025", "Mes Actual"],
			axisBorder: { show: false },
		},
		tooltip: {
			y: {
				formatter: (val) => `$${val.toLocaleString()}`,
			},
			theme: theme.palette.mode === "dark" ? "dark" : "light",
			fillSeriesColor: false,
		},
	};

	return (
		<DashboardCard
			title="Revenue Updates"
			subtitle="Overview of Profit"
		>
			<Grid container spacing={3}>
				{/* Gráfico de barras */}
				<Grid item xs={12} sm={8}>
					<Box className="rounded-bars">
						<Chart
							options={optionscolumnchart}
							series={seriescolumnchart}
							type="bar"
							height="370px"
						/>
					</Box>
				</Grid>

				{/* Métricas a la derecha */}
				<Grid item xs={12} sm={4}>
					<Stack spacing={3} mt={3}>
						<Stack direction="row" spacing={2} alignItems="center">
							<Box
								width={40}
								height={40}
								bgcolor="primary.light"
								display="flex"
								alignItems="center"
								justifyContent="center"
								borderRadius={1}
							>
								<Typography color="primary" variant="h6" display="flex">
									<IconGridDots width={21} />
								</Typography>
							</Box>
							<Box>
								<Typography variant="h3" fontWeight="700">
									$
									{data?.total_earnings?.toLocaleString(undefined, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									}) ?? "0.00"}
								</Typography>
								<Typography variant="subtitle2" color="textSecondary">
									Total Earnings
								</Typography>
							</Box>
						</Stack>
					</Stack>

					<Stack spacing={3} my={5}>
						<Stack direction="row" spacing={2} alignItems="center">
							<Avatar sx={{ width: 9, height: 9, bgcolor: primary }} />
							<Box>
								<Typography variant="subtitle1" color="textSecondary">
									Earnings this month
								</Typography>
								<Typography variant="h5">
									$
									{data?.earnings_mes?.toLocaleString(undefined, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									}) ?? "0.00"}
								</Typography>
							</Box>
						</Stack>

						<Stack direction="row" spacing={2} alignItems="center">
							<Avatar sx={{ width: 9, height: 10, bgcolor: secondary }} />
							<Box>
								<Typography variant="subtitle1" color="textSecondary">
									Expense this month
								</Typography>
								<Typography variant="h5">
									$
									{data?.expenses_mes?.toLocaleString(undefined, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									}) ?? "0.00"}
								</Typography>
							</Box>
						</Stack>
					</Stack>
				</Grid>
			</Grid>
		</DashboardCard>
	);
};

export default RevenueUpdates;
