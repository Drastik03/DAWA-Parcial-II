import { Grid } from "@mui/material";
import PageContainer from "../../../components/container/PageContainer";

import ProfileBanner from "src/components/apps/userprofile/profile/ProfileBanner";
import IntroCard from "src/components/apps/userprofile/profile/IntroCard";

const UserProfile = () => {
	return (
		<PageContainer title="User Profile" description="this is User Profile page">
			<Grid container spacing={3}>
				<Grid item sm={12}>
					<ProfileBanner />
				</Grid>

				<Grid item sm={12} lg={4} xs={12}>
					<Grid container spacing={3}>
						<Grid item sm={12}>
							<IntroCard />
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</PageContainer>
	);
};

export default UserProfile;
