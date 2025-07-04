/** biome-ignore-all lint/nursery/useUniqueElementIds: <explanation> */
import { useState } from "react";
import { Box, Menu } from "@mui/material";

const AppDD = () => {
	const [anchorEl2, setAnchorEl2] = useState(null);

	const handleClose2 = () => {
		setAnchorEl2(null);
	};

	return (
		<>
			<Box>
				{/* ------------------------------------------- */}
				{/* Message Dropdown */}
				{/* ------------------------------------------- */}
				<Menu
					id="msgs-menu"
					anchorEl={anchorEl2}
					keepMounted
					open={Boolean(anchorEl2)}
					onClose={handleClose2}
					anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
					transformOrigin={{ horizontal: "left", vertical: "top" }}
					sx={{
						"& .MuiMenu-paper": {
							width: "850px",
						},
						"& .MuiMenu-paper ul": {
							p: 0,
						},
					}}
				></Menu>
			</Box>
			{/*
          --- AQUI SI QUIEREN AGREGAR ITEMS DE MENU

          <Button color="inherit" sx={{color: (theme) => theme.palette.text.secondary}} variant="text" to="/apps/chats" component={Link}>
            Chat
          </Button>
          <Button color="inherit" sx={{color: (theme) => theme.palette.text.secondary}} variant="text" to="/apps/calendar" component={Link}>
            Calendar
          </Button>
          <Button color="inherit" sx={{color: (theme) => theme.palette.text.secondary}} variant="text" to="/apps/email" component={Link}>
            Email
          </Button>
        */}
		</>
	);
};

export default AppDD;
