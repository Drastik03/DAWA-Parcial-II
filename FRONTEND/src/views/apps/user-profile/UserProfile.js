import { Button, Grid } from "@mui/material";
import PageContainer from "../../../components/container/PageContainer";

import ProfileBanner from "src/components/apps/userprofile/profile/ProfileBanner";
import IntroCard from "src/components/apps/userprofile/profile/IntroCard";
import ChangePasswordModal from "../../../components/admin/users/ChangePasswordCard";
import { useState } from "react";
import UserInfoCard from "../../../components/admin/users/UserInfoCard";

const UserProfile = () => {
	const [open, setOpen] = useState(false);

	return (
		<PageContainer
			title="Perfil de Usuario"
			description="Información del perfil del usuario"
		>
			<Grid container spacing={3} justifyContent="center">
				<Grid item xs={12}>
					<ProfileBanner />
				</Grid>

				<Grid item xs={12} sm={10} md={6} lg={4}>
					<UserInfoCard onChangePassword={() => setOpen(true)} />
				</Grid>
			</Grid>

			<ChangePasswordModal open={open} onClose={() => setOpen(false)} />
		</PageContainer>
	);
};

export default UserProfile;
