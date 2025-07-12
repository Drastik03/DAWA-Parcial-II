import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ReactComponent as ClinicIcon } from "src/assets/images/logos/clinic-icon.svg";
import { styled } from "@mui/material";

const Logo = () => {
	const customizer = useSelector((state) => state.customizer);

	const LinkStyled = styled(Link)(() => ({
		height: customizer.TopbarHeight,
		width: customizer.isCollapse ? "40px" : "180px",
		overflow: "hidden",
		display: "flex",
		alignItems: "center",
	}));

	return (
		<LinkStyled to="/">
			<ClinicIcon />
		</LinkStyled>
	);
};

export default Logo;
