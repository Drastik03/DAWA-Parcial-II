import {
	Box,
	Avatar,
	Typography,
	IconButton,
	Tooltip,
	useMediaQuery,
} from "@mui/material";
import { useSelector } from "react-redux";
import img1 from "src/assets/images/profile/user-1.jpg";
import { IconPower } from "@tabler/icons";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../../context/AuthContext";
import { useEffect } from "react";

export const Profile = () => {
	const customizer = useSelector((state) => state.customizer);
	const { user, role } = useAuth();
	const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));
	useEffect(() => {
		console.log("Profile: user:", user, "role:", role);
	}, [user, role]);
	const hideMenu = lgUp
		? customizer.isCollapse && !customizer.isSidebarHover
		: "";
	return (
		<Box
			display={"flex"}
			alignItems="center"
			gap={2}
			sx={{ m: 3, p: 2, bgcolor: `${"secondary.light"}` }}
		>
			{!hideMenu
				? <>
						<Avatar alt="Remy Sharp" src={img1} />

						<Box>
							<Typography
								variant="subtitle2"
								color="textPrimary"
								fontWeight={600}
							>
								{user?.user.per_names
									? user.user.per_names
									: "No name provided"}
							</Typography>{" "}
							<Typography variant="caption" color="textSecondary">
								{role && role.rol_name ? role.rol_name : "No role provided"}
							</Typography>
						</Box>
						<Box sx={{ ml: "auto" }}>
							<Tooltip title="Logout" placement="top">
								<IconButton
									color="primary"
									component={Link}
									to="/auth/login"
									aria-label="logout"
									size="small"
								>
									<IconPower size="20" />
								</IconButton>
							</Tooltip>
						</Box>
					</>
				: ""}
		</Box>
	);
};
