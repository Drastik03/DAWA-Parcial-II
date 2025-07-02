import { getIconByName } from "./getIconByName";

export function transformModulesToMenu(modules) {
	return modules.flatMap((module) =>
		module.menu.map((menuItem) => ({
			...menuItem,
			icon: getIconByName(menuItem.menu_icon_name),
			submenu: menuItem.submenu
				? transformModulesToMenu([{ menu: menuItem.submenu }])
				: [],
		})),
	);
}
