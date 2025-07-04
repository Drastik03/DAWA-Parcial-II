// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
	es: {
		translation: {
			Profile: "Perfil",
			Users: "Usuarios",
			Calendar: "Calendario",
			Notes: "Notas",
			Blog: "Blog",
		},
	},
	en: {
		translation: {
			Profile: "Profile",
			Users: "Users",
			Calendar: "Calendar",
			Notes: "Notes",
			Blog: "Blog",
		},
	},
};

i18n.use(initReactI18next).init({
	resources,
	lng: localStorage.getItem("lang") || "es",
	interpolation: {
		escapeValue: false,
	},
});

export default i18n;
