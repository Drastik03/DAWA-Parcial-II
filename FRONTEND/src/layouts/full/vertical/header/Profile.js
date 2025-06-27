/** biome-ignore-all lint/nursery/useUniqueElementIds: <explanation> */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	Box,
	Menu,
	Avatar,
	Typography,
	Divider,
	Button,
	IconButton,
} from "@mui/material";
import * as dropdownData from "./data";

import { IconMail } from "@tabler/icons";
import { Stack } from "@mui/system";

import ProfileImg from "src/assets/images/profile/user-1.jpg";
import Scrollbar from "src/components/custom-scroll/Scrollbar";
import { useAuth } from "../../../../context/AuthContext";
import axios from "axios";

const Profile = () => {
	const [anchorEl2, setAnchorEl2] = useState(null);
	const { loginId, user, logout, login } = useAuth();
	const navigate = useNavigate();

	const handleClick2 = (event) => {
		setAnchorEl2(event.currentTarget);
	};
	const handleClose2 = () => {
		setAnchorEl2(null);
	};
	const handleLogout = async () => {
		try {
			const res = await axios.patch("http://localhost:5000/security/logout", {
				logId: loginId,
			});
			if (!res.data.result) {
				return;
			}
			logout();
			navigate("auth/login");
		} catch (error) {
			console.error("Error during logout:", error);
		}
	};
	console.log("Profile: login:", login);
	console.log("Profile: setUser:", user);

	return (
		<Box>
			<IconButton
				size="large"
				aria-label="show 11 new notifications"
				color="inherit"
				aria-controls="msgs-menu"
				aria-haspopup="true"
				sx={{
					...(typeof anchorEl2 === "object" && {
						color: "primary.main",
					}),
				}}
				onClick={handleClick2}
			>
				<Avatar
					src={ProfileImg}
					alt={ProfileImg}
					sx={{
						width: 35,
						height: 35,
					}}
				/>
			</IconButton>
			{/* ------------------------------------------- */}
			{/* Message Dropdown */}
			{/* ------------------------------------------- */}
			<Menu
				id="msgs-menu"
				anchorEl={anchorEl2}
				keepMounted
				open={Boolean(anchorEl2)}
				onClose={handleClose2}
				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
				transformOrigin={{ horizontal: "right", vertical: "top" }}
				sx={{
					"& .MuiMenu-paper": {
						width: "360px",
					},
				}}
			>
				<Scrollbar sx={{ height: "100%", maxHeight: "85vh" }}>
					<Box p={3}>
						<Typography variant="h5">User Profile</Typography>
						<Stack direction="row" py={3} spacing={2} alignItems="center">
							<Avatar
								src={ProfileImg}
								alt={ProfileImg}
								sx={{ width: 95, height: 95 }}
							/>
							<Box>
								<Typography
									variant="subtitle2"
									color="textPrimary"
									fontWeight={600}
								>
									{user && user.user.per_names && user.user.per_surnames
										? `${user.user.per_names} ${user.user.per_surnames}`
										: "No name provided"}
								</Typography>
								<Typography
									variant="subtitle2"
									color="textSecondary"
									display="flex"
									alignItems="center"
									gap={1}
								>
									<IconMail width={15} height={15} />
									{user && user.user.user_mail
										? user.user.user_mail
										: "No email provided"}
								</Typography>
							</Box>
						</Stack>
						<Divider />
						{dropdownData.profile.map((profile) => (
							<Box key={profile.title}>
								<Box sx={{ py: 2, px: 0 }} className="hover-text-primary">
									<Link to={profile.href}>
										<Stack direction="row" spacing={2}>
											<Box
												width="45px"
												height="45px"
												bgcolor="primary.light"
												display="flex"
												alignItems="center"
												justifyContent="center"
											>
												<Avatar
													src={profile.icon}
													alt={profile.icon}
													sx={{
														width: 24,
														height: 24,
														borderRadius: 0,
													}}
												/>
											</Box>
											<Box>
												<Typography
													variant="subtitle2"
													fontWeight={600}
													color="textPrimary"
													className="text-hover"
													noWrap
													sx={{
														width: "240px",
													}}
												>
													{profile.title}
												</Typography>
												<Typography
													color="textSecondary"
													variant="subtitle2"
													sx={{
														width: "240px",
													}}
													noWrap
												>
													{profile.subtitle}
												</Typography>
											</Box>
										</Stack>
									</Link>
								</Box>
							</Box>
						))}
						<Box mt={2}>
							<Button
								to="/auth/login"
								variant="outlined"
								color="primary"
								fullWidth
								// component={Link}
								onClick={handleLogout}
							>
								Logout
							</Button>
						</Box>
					</Box>
				</Scrollbar>
			</Menu>
		</Box>
	);
};

export default Profile;
