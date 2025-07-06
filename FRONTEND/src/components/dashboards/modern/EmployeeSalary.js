import React from "react";
import PropTypes from "prop-types";
import Chart from "react-apexcharts";
import { useTheme } from "@mui/material/styles";

import DashboardWidgetCard from "../../shared/DashboardWidgetCard";

const TopSellingProductsChart = ({ data, salesData = [] }) => {
	const theme = useTheme();
	const primary = theme.palette.primary.main;
	const secondary = theme.palette.grey[300];
	const textPrimary = theme.palette.text.primary;

	const totalNomina = data?.total_nomina ?? 0;
	const productMasVendido = data?.product_mas_vendido ?? "Producto más vendido";

	const valores = salesData.length ? salesData : [20, 15, 30, 25, 10, 15];
	const maxIndex = valores.indexOf(Math.max(...valores));

	const series = [
		{
			name: productMasVendido,
			data: valores,
		},
	];

	const colors = valores.map((_, i) => (i === maxIndex ? primary : secondary));

	const options = {
		chart: {
			type: "bar",
			fontFamily: "'Plus Jakarta Sans', sans-serif",
			foreColor: textPrimary,
			toolbar: { show: false },
			height: 280,
		},
		colors,
		plotOptions: {
			bar: {
				borderRadius: 6,
				columnWidth: "45%",
				distributed: true,
				endingShape: "rounded",
			},
		},
		dataLabels: { enabled: false },
		legend: {
			show: true,
			position: "top",
			horizontalAlign: "left",
			fontWeight: "bold",
			labels: { colors: textPrimary },
		},
		grid: {
			yaxis: { lines: { show: false } },
		},
		xaxis: {
			categories: [],
			axisBorder: { show: false },
			labels: { show: false },
			crosshairs: { show: false },
			tooltip: { enabled: false },
		},
		yaxis: {
			labels: { show: false },
			axisBorder: { show: false },
			axisTicks: { show: false },
			tooltip: { enabled: false },
		},
		tooltip: {
			theme: theme.palette.mode,
			y: {
				formatter: (val) => `$${val.toLocaleString()}`,
			},
		},
	};

	return (
		<DashboardWidgetCard
			title="Productos más vendidos"
			subtitle="Resumen de ventas mensuales"
			dataLabel1="Total Sales"
			dataItem1={`$${totalNomina.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
		>
			<Chart options={options} series={series} type="bar" height={280} />
		</DashboardWidgetCard>
	);
};

TopSellingProductsChart.propTypes = {
	data: PropTypes.shape({
		total_nomina: PropTypes.number,
		product_mas_vendido: PropTypes.string,
	}),
	salesData: PropTypes.arrayOf(PropTypes.number),
};

export default TopSellingProductsChart;
