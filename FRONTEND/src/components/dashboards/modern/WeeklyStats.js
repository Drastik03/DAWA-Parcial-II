import Chart from "react-apexcharts";
import { useTheme } from "@mui/material/styles";
import { Stack, Typography, Avatar, Box } from "@mui/material";
import DashboardCard from "../../shared/DashboardCard";
import { IconGridDots } from "@tabler/icons";

const WeeklyStats = ({ dashboardData }) => {
	const theme = useTheme();

	const data = dashboardData ?? {};

	const primary = theme.palette.primary.main;
	const primarylight = theme.palette.primary.light;
	const error = theme.palette.error.main;
	const errorlight = theme.palette.error.light;
	const secondary = theme.palette.success.main;
	const secondarylight = theme.palette.success.light;
	const seriescolumnchart = [
		{
			name: "Earnings",
			data: [data.earnings_mes ?? 0, data.total_earnings ?? 0],
			color: primary,
		},
		{
			name: "Expenses",
			data: [data.expenses_mes ?? 0, data.total_expenses ?? 0],
			color: error,
		},
	];

	const optionscolumnchart = {
		chart: {
			type: "area",
			fontFamily: "'Plus Jakarta Sans', sans-serif;",
			foreColor: "#adb0bb",
			toolbar: { show: false },
			height: 130,
			sparkline: { enabled: true },
			group: "sparklines",
		},
		stroke: { curve: "smooth", width: 2 },
		fill: {
			type: "gradient",
			gradient: {
				shadeIntensity: 0,
				inverseColors: false,
				opacityFrom: 0.45,
				opacityTo: 0,
				stops: [20, 180],
			},
		},
		markers: { size: 0 },
		tooltip: {
			theme: theme.palette.mode === "dark" ? "dark" : "light",
			x: { show: false },
		},
	};

	const stats = [
		{
			title: "Total Facturas",
			subtitle: String(data.total_facturas ?? "0"),
			color: error,
			lightcolor: errorlight,
			icon: <IconGridDots width={18} />,
		},
		{
			title: "Total Nómina",
			subtitle: `$${(data.total_nomina ?? 0).toFixed(2)}`,
			color: theme.palette.info.main,
			lightcolor: theme.palette.info.light,
			icon: <IconGridDots width={18} />,
		},
		{
			title: "Más vendido",
			subtitle: data.product_mas_vendido ?? "-",
			color: theme.palette.warning.main,
			lightcolor: theme.palette.warning.light,
			icon: <IconGridDots width={18} />,
		},
	];

	return (
		<DashboardCard title="Weekly Stats" subtitle="Average sales">
			<>
				<Stack mt={4}>
					<Chart
						options={optionscolumnchart}
						series={seriescolumnchart}
						type="area"
						height="130px"
					/>
				</Stack>
				<Stack spacing={3} mt={3}>
					{stats.map((stat, i) => (
						<Stack
							direction="row"
							spacing={2}
							justifyContent="space-between"
							alignItems="center"
							key={i}
						>
							<Stack direction="row" alignItems="center" spacing={2}>
								<Avatar
									variant="rounded"
									sx={{
										bgcolor: stat.lightcolor,
										color: stat.color,
										width: 40,
										height: 40,
									}}
								>
									{stat.icon}
								</Avatar>
								<Box>
									<Typography variant="h6" mb="4px">
										{stat.title}
									</Typography>
									<Typography variant="subtitle2" color="textSecondary">
										{stat.subtitle}
									</Typography>
								</Box>
							</Stack>
							<Avatar
								sx={{
									bgcolor: stat.lightcolor,
									color: stat.color,
									width: 42,
									height: 24,
									borderRadius: "4px",
								}}
							>
								<Typography variant="subtitle2" fontWeight="600">
									{/* Puedes mostrar un % u otro dato aquí si quieres */}
									&nbsp;
								</Typography>
							</Avatar>
						</Stack>
					))}
				</Stack>
			</>
		</DashboardCard>
	);
};

export default WeeklyStats;
