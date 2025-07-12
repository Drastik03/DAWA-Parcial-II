import { Box, CardContent, Grid, Typography } from "@mui/material";

import icon1 from "../../../assets/images/svgs/icon-connect.svg";
import icon2 from "../../../assets/images/svgs/icon-user-male.svg";
import icon3 from "../../../assets/images/svgs/icon-briefcase.svg";
import icon4 from "../../../assets/images/svgs/icon-mailbox.svg";
import icon5 from "../../../assets/images/svgs/icon-favorites.svg";
import icon6 from "../../../assets/images/svgs/icon-speech-bubble.svg";

const TopCards = ({ cardValue = {} }) => {
	console.log(cardValue);

	const topcards = [
		{
			icon: icon2,
			title: "Empleados",
			digits: cardValue.total_empleados ?? 0,
			bgcolor: "primary",
		},
		{
			icon: icon3,
			title: "Clientes",
			digits: cardValue.total_clientes ?? 0,
			bgcolor: "warning",
		},
		{
			icon: icon4,
			title: "Invoice",
			digits: cardValue.total_facturas ?? 0,
			bgcolor: "secondary",
		},
		{
			icon: icon5,
			title: "Promociones",
			digits: cardValue.total_promociones ?? 0,
			bgcolor: "error",
		},
		{
			icon: icon6,
			title: "Nómina",
			digits:
				cardValue.total_nomina !== undefined
					? `$${cardValue.total_nomina.toFixed(2)}`
					: "$0.00",
			bgcolor: "success",
		},
		{
			icon: icon1,
			title: "Ganancias",
			digits:
				cardValue.total_earnings !== undefined
					? `$${cardValue.total_earnings.toFixed(2)}`
					: "$0.00",
			bgcolor: "info",
		},
	];

	return (
		<Grid container spacing={3} mt={2}>
			{topcards.map((topcard, i) => (
				<Grid item xs={12} sm={4} lg={2} key={topcard.title}>
					<Box
						sx={{
							bgcolor: `${topcard.bgcolor}.light`,
							textAlign: "center",
							borderRadius: 2,
							p: 2,
						}}
					>
						<CardContent>
							<img src={topcard.icon} alt={topcard.title} width="50" />
							<Typography
								color={`${topcard.bgcolor}.main`}
								mt={1}
								variant="subtitle1"
								fontWeight={600}
							>
								{topcard.title}
							</Typography>
							<Typography
								color={`${topcard.bgcolor}.main`}
								variant="h4"
								fontWeight={600}
							>
								{topcard.digits}
							</Typography>
						</CardContent>
					</Box>
				</Grid>
			))}
		</Grid>
	);
};

export default TopCards;
