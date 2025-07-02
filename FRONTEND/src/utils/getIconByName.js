import * as TablerIcons from "@tabler/icons-react";

export function getIconByName(name) {
	if (!name) return null;
	const iconName = name.startsWith("Icon") ? name : `Icon${name}`;
	return TablerIcons[iconName] || null;
}
