import { useEffect, useState } from "react";
import {
	Grid,
	Box,
	Typography,
	Avatar,
	Stack,
	CardMedia,
	styled,
	Skeleton,
} from "@mui/material";


import profilecover from "src/assets/images/backgrounds/profilebg.jpg";
import userimg from "src/assets/images/profile/user-1.jpg";
import BlankCard from "../../../shared/BlankCard";
import ProfileTab from "./ProfileTab";
import { useAuth } from "src/context/AuthContext";

const ProfileBanner = () => {
	const { user } = useAuth(); 
	const [isLoading, setLoading] = useState(true);

	const ProfileImage = styled(Box)(() => ({
		backgroundImage: "linear-gradient(#50b2fc,#f44c66)",
		borderRadius: "50%",
		width: "110px",
		height: "110px",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		margin: "0 auto",
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
				? <Skeleton variant="rectangular" width="100%" height={330} />
				: <CardMedia
						component="img"
						image={profilecover}
						alt="cover"
						width="100%"
					/>}

			<Grid container spacing={0} justifyContent="center" alignItems="center">
				<Grid item lg={4} sm={12} md={5} xs={12}>
					<Stack
						direction="row"
						textAlign="center"
						justifyContent="center"
						gap={6}
						m={3}
					></Stack>
				</Grid>

				<Grid item lg={12} sm={12} xs={12}>
					<Box
						display="flex"
						justifyContent="center"
						alignItems="center"
						sx={{ mt: "-85px" }}
					>
						<Box>
							<ProfileImage>
								<Avatar
									src={userimg}
									alt="avatar"
									sx={{
										borderRadius: "50%",
										width: "100px",
										height: "100px",
										border: "4px solid #fff",
									}}
								/>
							</ProfileImage>
							<Box mt={1} textAlign="center">
								<Typography fontWeight={600} variant="h5">
									{per_names} {per_surnames}
								</Typography>
								<Typography color="textSecondary" variant="h6" fontWeight={400}>
									{user_mail}
								</Typography>
							</Box>
						</Box>
					</Box>
				</Grid>
			</Grid>
			<ProfileTab />
		</BlankCard>
	);
};

export default ProfileBanner;
