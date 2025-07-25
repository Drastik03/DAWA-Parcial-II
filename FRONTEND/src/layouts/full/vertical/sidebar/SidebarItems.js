import Menuitems, { generateMenuFromRole } from "./MenuItems";
import { useLocation } from "react-router";
import { Box, List, useMediaQuery } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { toggleMobileSidebar } from "src/store/customizer/CustomizerSlice";
import NavItem from "./NavItem";
import NavCollapse from "./NavCollapse";
import NavGroup from "./NavGroup/NavGroup";
import { useAuth } from "../../../../context/AuthContext";

const SidebarItems = () => {
	const { pathname } = useLocation();
	const pathDirect = pathname;
	const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf("/"));
	const customizer = useSelector((state) => state.customizer);
	const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));
	const hideMenu = lgUp
		? customizer.isCollapse && !customizer.isSidebarHover
		: "";
	const dispatch = useDispatch();
	const { menuRole } = useAuth();

	const menuItems = generateMenuFromRole(menuRole);
	console.log(generateMenuFromRole(menuRole));

	return (
		<Box sx={{ px: 3 }}>
			<List sx={{ pt: 0 }} className="sidebarNav">
				{menuItems.map((item, index) => {
					// {/********SubHeader**********/}
					if (item.subheader) {
						return (
							<NavGroup item={item} hideMenu={hideMenu} key={item.subheader} />
						);

						// {/********If Sub Menu**********/}
						/* eslint no-else-return: "off" */
					} else if (item.children && item.children.length > 0) {
						console.log(item);

						return (
							<NavCollapse
								menu={item}
								pathDirect={pathDirect}
								hideMenu={hideMenu}
								pathWithoutLastPart={pathWithoutLastPart}
								level={1}
								key={item.id}
								onClick={() => dispatch(toggleMobileSidebar())}
							/>
						);

						// {/********If Sub No Menu**********/}
					} else {
						return (
							<NavItem
								item={item}
								key={item.id}
								pathDirect={pathDirect}
								hideMenu={hideMenu}
								onClick={() => dispatch(toggleMobileSidebar())}
							/>
						);
					}
				})}
			</List>
		</Box>
	);
};
export default SidebarItems;
