import { uniqueId } from "lodash";
import * as TablerIcons from "@tabler/icons";
import Menuitems from "../../horizontal/navbar/Menudata";

const DefaultIcon = TablerIcons.IconCircle || (() => null);

function getIconByName(iconName) {
	return iconName && TablerIcons[iconName]
		? TablerIcons[iconName]
		: DefaultIcon;
}

function cleanHref(href) {
	if (!href) return null;
	return href.startsWith("/") ? href.slice(1) : href;
}

export function generateMenuFromRole(menuRole) {
	if (!menuRole) return [];

	const menuItems = [];

	menuRole.forEach((rol) => {
		rol.modules.forEach((mod) => {
			const modId = mod.mod_id || `${mod.mod_name}-${uniqueId("mod")}`;
			const modIcon = getIconByName(mod.mod_icon_name);

			menuItems.push({
				id: `navlabel-${modId}`,
				navlabel: true,
				subheader: mod.mod_name,
			});

			const children = (mod.menu || [])
				.filter((menu) => !menu.menu_parent_id)
				.map((menu) => {
					const menuId =
						menu.menu_id || `${menu.menu_name}-${uniqueId("menu")}`;
					const menuIcon = getIconByName(menu.menu_icon_name);

					const subChildren =
						menu.submenu && menu.submenu.length > 0
							? menu.submenu.map((sub) => ({
									id: sub.menu_id || `${sub.menu_name}-${uniqueId("sub")}`,
									title: sub.menu_name,
									icon: getIconByName(sub.menu_icon_name),
									href: cleanHref(sub.menu_href || sub.menu_url),
									children: [],
								}))
							: [];

					return {
						id: menuId,
						title: menu.menu_name,
						icon: menuIcon,
						href: cleanHref(menu.menu_href || menu.menu_url),
						children: subChildren,
					};
				});

			menuItems.push({
				id: modId,
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
