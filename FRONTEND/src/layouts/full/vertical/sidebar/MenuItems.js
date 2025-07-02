import { uniqueId } from "lodash";
import * as TablerIcons from "@tabler/icons";
import Menuitems from "../../horizontal/navbar/Menudata";

const DefaultIcon = TablerIcons.IconCircle || (() => null);

function getIconByName(iconName) {
	return iconName && TablerIcons[iconName]
		? TablerIcons[iconName]
		: DefaultIcon;
}


export function generateMenuFromRole(menuRole) {
	if (!menuRole) return [];

	const menuItems = [];

	menuRole.forEach((rol) => {
		rol.modules.forEach((mod) => {
			menuItems.push({
				navlabel: true,
				subheader: mod.mod_name,
			});

			const modIcon = getIconByName(mod.mod_icon_name);

			function cleanHref(href) {
				if (!href) return null;
				return href.startsWith("/") ? href.slice(1) : href;
			}

			const children = (mod.menu || []).map((menu) => {
				const menuIcon = getIconByName(menu.menu_icon_name);

				const subChildren =
					menu.submenu && menu.submenu.length > 0
						? menu.submenu.map((sub) => ({
								id: uniqueId(),
								title: sub.menu_name,
								icon: getIconByName(sub.menu_icon_name),
								href: cleanHref(sub.menu_href || sub.menu_url),
								children: [],
							}))
						: [];

				return {
					id: uniqueId(),
					title: menu.menu_name,
					icon: menuIcon,
					href: cleanHref(menu.menu_href || menu.menu_url),
					children: subChildren,
				};
			});
			  

			menuItems.push({
				id: uniqueId(),
				title: mod.mod_name,
				icon: modIcon,
				href: null,
				children,
			});
		});
	});

	return menuItems;
}

export default Menuitems;
