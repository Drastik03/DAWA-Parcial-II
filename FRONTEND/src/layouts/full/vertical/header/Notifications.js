/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
import { useState } from "react";
import { Link } from "react-router-dom";
import {
	IconButton,
	Box,
	Badge,
	Menu,
	MenuItem,
	Typography,
	Button,
	Chip,
	CircularProgress,
} from "@mui/material";
import Scrollbar from "src/components/custom-scroll/Scrollbar";
import Cookies from "js-cookie";

import { IconBellRinging, IconCheck } from "@tabler/icons";
import { Stack } from "@mui/system";
import { useFetch } from "../../../../hooks/useFetch";
import axios from "axios";

const Notifications = () => {
	const [anchorEl2, setAnchorEl2] = useState(null);

	const handleClick2 = (event) => {
		setAnchorEl2(event.currentTarget);
	};

	const handleClose2 = () => {
		setAnchorEl2(null);
	};

	const { data, loading, refetch } = useFetch(
		"http://localhost:5000/Notification/list",
	);

	const readNotification = async (id) => {
		try {
			await axios.patch(
				"http://localhost:5000/Notification/read",
				{
					notification_read: true,
					notification_id: id,
				},
				{
					headers: {
						tokenapp: Cookies.get("token"),
					},
				},
			);
			refetch();
		} catch (error) {
			console.error("Error al leer notificación", error);
		}
	};



	const unreadNotifications = Array.isArray(data)
		? data.filter((n) => n.sun_isread_notification === false)
		: [];

	return (
		<Box>
			<IconButton
				size="large"
				aria-label="show new notifications"
				color="inherit"
				aria-controls="msgs-menu"
				aria-haspopup="true"
				sx={anchorEl2 && { color: "primary.main" }}
				onClick={handleClick2}
			>
				<Badge
					variant="dot"
					color="primary"
					invisible={unreadNotifications.length === 0}
				>
					<IconBellRinging size="21" stroke="1.5" />
				</Badge>
			</IconButton>

			<Menu
				id="msgs-menu"
				anchorEl={anchorEl2}
				keepMounted
				open={Boolean(anchorEl2)}
				onClose={handleClose2}
				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
				transformOrigin={{ horizontal: "right", vertical: "top" }}
				sx={{ "& .MuiMenu-paper": { width: "360px" } }}
			>
				<Stack
					direction="row"
					py={2}
					px={4}
					justifyContent="space-between"
					alignItems="center"
				>
					<Typography variant="h6">Notifications</Typography>
					<Chip
						label={`${unreadNotifications.length} new`}
						color="primary"
						size="small"
					/>
				</Stack>

				<Scrollbar sx={{ height: "385px" }}>
					{loading
						? <Box
								display="flex"
								justifyContent="center"
								alignItems="center"
								height="100%"
							>
								<CircularProgress size={24} />
							</Box>
						: unreadNotifications.length === 0
							? <Box p={2}>
									<Typography textAlign="center">No notifications</Typography>
								</Box>
							: unreadNotifications.map((notification, index) => (
									<Box key={notification.sun_id || index}>
										<MenuItem sx={{ py: 2, px: 4 }}>
											<Stack direction="row" spacing={2}>
												<Box>
													<Typography
														variant="subtitle2"
														color="textPrimary"
														fontWeight={600}
														noWrap
														sx={{ width: "240px" }}
													>
														{notification.sun_title_notification}
													</Typography>
													<Typography
														color="textSecondary"
														variant="subtitle2"
														sx={{ width: "240px" }}
														noWrap
													>
														{notification.sun_text_notification}
													</Typography>
												</Box>
											</Stack>
											<Button
												color="inherit"
												onClick={() => readNotification(notification.sun_id)}
											>
												<IconCheck />
											</Button>
										</MenuItem>
									</Box>
								))}
				</Scrollbar>
			</Menu>
		</Box>
	);
};

export default Notifications;
