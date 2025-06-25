import { Stack, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import ChildCard from "src/components/shared/ChildCard";
import { useAuth } from "../../../../context/AuthContext";

const UserInfoCard = () => {
	const { user, role } = useAuth();
	console.log("ROLE PROFILE:", role);

	if (!user?.user) {
		return null;
	}

	const { user_login_id, user_mail, per_names, per_surnames } = user.user;

	return (
		<ChildCard>
			<Typography fontWeight={600} variant="h4" mb={2}>
				Perfil de Usuario
			</Typography>
			<Stack direction="row" gap={2} alignItems="center" mb={2}>
				<BadgeIcon />
				<Typography variant="h6">
					{per_names} {per_surnames}
				</Typography>
			</Stack>
			<Stack direction="row" gap={2} alignItems="center" mb={2}>
				<PersonIcon />
				<Typography variant="h6">{user_login_id}</Typography>
			</Stack>
			<Stack direction="row" gap={2} alignItems="center" mb={2}>
				<EmailIcon />
				<Typography variant="h6">{user_mail}</Typography>
			</Stack>
			<Stack direction="row" gap={2} alignItems="center" mb={2}>
				<BadgeIcon />
				<Typography variant="h6">Rol: {role?.rol_name}</Typography>
			</Stack>
		</ChildCard>
	);
};

export default UserInfoCard;
