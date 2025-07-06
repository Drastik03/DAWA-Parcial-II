import React from "react";
import Chart from "react-apexcharts";
import { useTheme } from "@mui/material/styles";
import { Grid, Stack, Typography, Avatar } from "@mui/material";
import { IconArrowUpLeft, IconArrowDownRight } from "@tabler/icons-react";

import DashboardCard from "../../shared/DashboardCard";

const YearlyBreakup = ({ data }) => {
	const theme = useTheme();
	const primary = theme.palette.primary.main;
	const primarylight = theme.palette.primary.light;
	const successlight = theme.palette.success.light;
	const errorlight = theme.palette.error.light;

	const ingresos2024 = data?.total_2024 ?? 0;
	const ingresos2025 = data?.total_2025 ?? 0;
	const nomina = data?.total_nomina ?? 0;

	const porcentajeCrecimiento =
		ingresos2024 === 0
			? 0
			: ((ingresos2025 - ingresos2024) / ingresos2024) * 100;

	const seriescolumnchart = [ingresos2024, ingresos2025, nomina];

	const optionscolumnchart = {
		chart: {
			type: "donut",
			fontFamily: "'Plus Jakarta Sans', sans-serif;",
			foreColor: "#adb0bb",
			toolbar: { show: false },
			height: 155,
		},
		colors: [primary, primarylight, "#F9F9FD"],
		plotOptions: {
			pie: {
				startAngle: 0,
				endAngle: 360,
				donut: { size: "75%", background: "transparent" },
			},
		},
		tooltip: { enabled: true },
		stroke: { show: false },
		dataLabels: { enabled: false },
		legend: { show: false },
		responsive: [
			{
				breakpoint: 991,
				options: { chart: { width: 120 } },
			},
		],
		labels: ["2024", "2025", "Nómina"],
	};

	return (
		<DashboardCard title="Desglose Anual">
			<Grid container spacing={3}>
				{/* Detalle numérico */}
				<Grid item xs={7} sm={7}>
					<Typography variant="h3" fontWeight="700">
						$
						{ingresos2025.toLocaleString(undefined, {
							minimumFractionDigits: 2,
						})}
					</Typography>
					<Stack spacing={3} mt={5} direction="row">
						<Stack direction="row" spacing={1} alignItems="center">
							<Typography variant="subtitle2" color="textSecondary">
								2024
							</Typography>
						</Stack>
						<Stack direction="row" spacing={1} alignItems="center">
							<Avatar
								sx={{
									width: 9,
									height: 9,
									bgcolor: primarylight,
									svg: { display: "none" },
								}}
							/>
							<Typography variant="subtitle2" color="textSecondary">
								2025
							</Typography>
						</Stack>
						<Stack direction="row" spacing={1} alignItems="center">
							<Avatar
								sx={{
									width: 9,
									height: 9,
									bgcolor: "#F9F9FD",
									svg: { display: "none" },
								}}
							/>
						</Stack>
					</Stack>
				</Grid>

				{/* Gráfico tipo donut */}
				<Grid item xs={5} sm={5}>
					<Chart
						options={optionscolumnchart}
						series={seriescolumnchart}
						type="donut"
						height="130px"
					/>
				</Grid>
			</Grid>
		</DashboardCard>
	);
};

export default YearlyBreakup;
