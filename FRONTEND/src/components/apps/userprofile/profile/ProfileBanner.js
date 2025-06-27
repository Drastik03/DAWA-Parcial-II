import { useEffect, useState } from "react";
import {
	Box,
	Typography,
	Avatar,
	CardMedia,
	styled,
	Skeleton,
	useTheme,
} from "@mui/material";

import profilecover from "src/assets/images/backgrounds/profilebg.jpg";
import userimg from "src/assets/images/profile/user-1.jpg";
import BlankCard from "../../../shared/BlankCard";
import ProfileTab from "./ProfileTab";
import { useAuth } from "src/context/AuthContext";

const ProfileBanner = () => {
	const { user } = useAuth();
	const [isLoading, setLoading] = useState(true);
	const theme = useTheme();

	const ProfileImageWrapper = styled(Box)(() => ({
		background: "linear-gradient(135deg, #50b2fc, #f44c66)",
		borderRadius: "50%",
		width: 120,
		height: 120,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		margin: "0 auto",
		boxShadow: theme.shadows[4],
	}));

	useEffect(() => {
		const timer = setTimeout(() => setLoading(false), 500);
		return () => clearTimeout(timer);
	}, []);

	if (!user?.user) return null;

	const { per_names, per_surnames, user_mail } = user.user;

	return (
		<BlankCard>
			{isLoading
				? <Skeleton
						variant="rectangular"
						width="100%"
						height={330}
						sx={{ borderRadius: 2 }}
					/>
				: <CardMedia
						component="img"
						image={profilecover}
						alt="cover"
						height="240"
					/>}

			<Box display="flex" flexDirection="column" alignItems="center" mt={-7}>
				<ProfileImageWrapper>
					<Avatar
						sx={{
							width: 80,
							height: 80,
							bgcolor: "primary.main",
							fontSize: 32,
						}}
					>
						{per_names?.[0] ?? "U"}
					</Avatar>
				</ProfileImageWrapper>

				<Typography variant="h5" fontWeight={600} mt={1}>
					{per_names} {per_surnames}
				</Typography>

				<Typography variant="body1" color="text.secondary">
					{user_mail}
				</Typography>
			</Box>

			<ProfileTab />
		</BlankCard>
	);
};

export default ProfileBanner;
