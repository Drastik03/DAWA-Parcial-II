import React from "react";
import { Box, Grid } from "@mui/material";
import TopCards from "../../components/dashboards/modern/TopCards";
import RevenueUpdates from "../../components/dashboards/modern/RevenueUpdates";
import YearlyBreakup from "../../components/dashboards/modern/YearlyBreakup";
import MonthlyEarnings from "../../components/dashboards/modern/MonthlyEarnings";
import EmployeeSalary from "../../components/dashboards/modern/EmployeeSalary";
import SellingProducts from "../../components/dashboards/modern/SellingProducts";
import WeeklyStats from "../../components/dashboards/modern/WeeklyStats";
import Welcome from "src/layouts/full/shared/welcome/Welcome";
import { useFetch } from "../../hooks/useFetch";

const Modern = () => {
	const { data } = useFetch(
		`${import.meta.env.VITE_API_URL}/admin/dashboard/list`,
	);
	console.log(data);
	const dashboardData = data?.data?.data[0];
	console.log(dashboardData);

	return (
		<Box>
			<Box>
				<Grid container spacing={3}>
					<Grid item xs={12}>
						<TopCards cardValue={dashboardData} />
					</Grid>

					<Grid item xs={12} lg={8}>
						<RevenueUpdates data={dashboardData} />
					</Grid>

					<Grid item xs={12} lg={4}>
						<Grid container spacing={3}>
							<Grid item xs={12}>
								<YearlyBreakup data={dashboardData} />
							</Grid>
							<Grid item xs={12}>
								<MonthlyEarnings data={dashboardData} />
							</Grid>
						</Grid>
					</Grid>

					<Grid item xs={12} lg={4}>
						<EmployeeSalary data={dashboardData} />
					</Grid>
					<Grid item xs={12} lg={4}>
						<SellingProducts data={dashboardData} />
					</Grid>

					<Grid item xs={12} lg={4}>
						<WeeklyStats dashboardData={dashboardData} />
					</Grid>
				</Grid>

				<Welcome />
			</Box>
		</Box>
	);
};

export default Modern;
