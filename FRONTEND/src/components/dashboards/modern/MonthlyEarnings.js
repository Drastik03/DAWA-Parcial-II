import React from "react";
import Chart from "react-apexcharts";
import { useTheme } from "@mui/material/styles";
import { Stack, Typography, Avatar, Fab } from "@mui/material";
import {
	IconArrowDownRight,
	IconArrowUpRight,
	IconCurrencyDollar,
} from "@tabler/icons";

import DashboardCard from "../../shared/DashboardCard";

const MonthlyEarnings = ({ data }) => {
	const theme = useTheme();
	const secondary = theme.palette.secondary.main;
	const secondarylight = theme.palette.secondary.light;
	const errorlight = theme.palette.error.light;
	const successlight = theme.palette.success.light;

	// Extraer datos o usar valores por defecto
	const earningsMes = data?.earnings_mes ?? 0;

	// Simular o pasar porcentaje (puedes calcularlo tú o pedirlo en el backend)
	// Aquí lo calculo como ejemplo: comparación entre este mes y mes anterior (si tuvieras ese dato)
	// Si no tienes, pones un valor fijo o 0
	const porcentajeCambio = data?.percentage_change_monthly ?? -9; // ejemplo fijo -9%
	const esCrecimiento = porcentajeCambio >= 0;

	// Si tienes datos reales para el gráfico mensual, pásalos aquí
	// Por simplicidad, replicamos el mismo valor 7 días para el gráfico sparkline
	const seriescolumnchart = [
		{
			name: "Earnings",
			color: secondary,
			data: new Array(7).fill(earningsMes),
		},
	];

	const optionscolumnchart = {
		chart: {
			type: "area",
			fontFamily: "'Plus Jakarta Sans', sans-serif;",
			foreColor: "#adb0bb",
			toolbar: { show: false },
			height: 60,
			sparkline: { enabled: true },
			group: "sparklines",
		},
		stroke: {
			curve: "smooth",
			width: 2,
		},
		fill: {
			colors: [secondarylight],
			type: "solid",
			opacity: 0.05,
		},
		markers: { size: 0 },
		tooltip: {
			theme: theme.palette.mode === "dark" ? "dark" : "light",
			x: { show: false },
			y: {
				formatter: (val) =>
					`$${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
			},
		},
	};

	return (
		<DashboardCard
			title="Monthly Earnings"
			action={
				<Fab color="secondary" size="medium">
					<IconCurrencyDollar width={24} />
				</Fab>
			}
			footer={
				<Chart
					options={optionscolumnchart}
					series={seriescolumnchart}
					type="area"
					height="60px"
				/>
			}
		>
			<>
				<Typography variant="h3" fontWeight="700" mt="-20px">
					${earningsMes.toLocaleString(undefined, { minimumFractionDigits: 2 })}
				</Typography>

				<Stack direction="row" spacing={1} my={1} alignItems="center">
					<Avatar
						sx={{
							bgcolor: esCrecimiento ? successlight : errorlight,
							width: 27,
							height: 27,
						}}
					>
						{esCrecimiento ? (
							<IconArrowUpRight width={20} color="#39B69A" />
						) : (
							<IconArrowDownRight width={20} color="#FA896B" />
						)}
					</Avatar>
					<Typography variant="subtitle2" fontWeight="600">
						{esCrecimiento ? "+" : ""}
						{Math.abs(porcentajeCambio).toFixed(2)}%
					</Typography>
					<Typography variant="subtitle2" color="textSecondary">
						last month
					</Typography>
				</Stack>
			</>
		</DashboardCard>
	);
};

export default MonthlyEarnings;
