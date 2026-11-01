import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
	locales: ["en", "pt-BR"],
	defaultLocale: "en",
	localePrefix: "always",
	localeDetection: true,
	localeCookie: {
		name: "NEXT_LOCALE",
		maxAge: 30 * 24 * 60 * 60
	}
})
