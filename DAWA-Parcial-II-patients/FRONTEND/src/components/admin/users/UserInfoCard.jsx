import {
	Stack,
	Typography,
	Button,
	Divider,
	Avatar,
	useTheme,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import ChildCard from "src/components/shared/ChildCard";
import { useAuth } from "../../../context/AuthContext";

const UserInfoCard = ({ onChangePassword }) => {
	const { user, role } = useAuth();
	const theme = useTheme();

	if (!user?.user) return null;

	const { user_login_id, user_mail, per_names, per_surnames } = user.user;

	return (
		<ChildCard>
			<Stack spacing={2} alignItems="center" textAlign="center">
				<Divider flexItem sx={{ width: "100%" }} />

				<Stack direction="row" alignItems="center" spacing={1}>
					<PersonIcon sx={{ color: theme.palette.text.secondary }} />
					<Typography variant="body1">{user_login_id}</Typography>
				</Stack>

				<Stack direction="row" alignItems="center" spacing={1}>
					<EmailIcon sx={{ color: theme.palette.text.secondary }} />
					<Typography variant="body1">{user_mail}</Typography>
				</Stack>

				<Stack direction="row" alignItems="center" spacing={1}>
					<BadgeIcon sx={{ color: theme.palette.text.secondary }} />
					<Typography variant="body1">Rol: {role?.rol_name}</Typography>
				</Stack>

				<Button
					variant="outlined"
					onClick={onChangePassword}
					sx={{ mt: 2, width: "100%" }}
				>
					Cambiar Contraseña
				</Button>
			</Stack>
		</ChildCard>
	);
};

export default UserInfoCard;
