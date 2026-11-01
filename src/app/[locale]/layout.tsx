import type { Metadata, Viewport } from "next"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getLocale, getTranslations } from "next-intl/server"
import { getPathname } from "@i18n/navigation"
import { BASE_URL } from "@app/constants"
import { poppins } from "@app/fonts"
import { routing } from "@i18n/routing"
import LanguageSwitcher from "@components/LanguageSwitcher"
import "../globals.css"

const OPEN_GRAPH_LOCALES = {
	en: "en_US",
	"pt-BR": "pt_BR"
} satisfies Record<typeof routing.locales[number], string>

export const viewport: Viewport = {
	themeColor: "#0b1220",
	colorScheme: "dark"
}

export function generateStaticParams(){
	return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata(): Promise<Metadata>{
	const [t, locale] = await Promise.all([
		getTranslations(),
		getLocale()
	])

	const title = t("metadata.title")
	const description = t("metadata.description")

	return {
		title,
		description,
		applicationName: title,
		metadataBase: BASE_URL,
		alternates: {
			canonical: getPathname({ href: "/", locale }),
			languages: {
				...Object.fromEntries(routing.locales.map((alternate) => [alternate, getPathname({ href: "/", locale: alternate })])),
				"x-default": getPathname({ href: "/", locale: routing.defaultLocale })
			}
		},
		openGraph: {
			title,
			description,
			type: "website",
			locale: OPEN_GRAPH_LOCALES[locale]
		},
		other: {
			"darkreader-lock": "true"
		},
		robots: {
			index: true,
			follow: true
		},
		authors: {
			name: "Kayo Souza"
		},
		generator: "Next.js",
		referrer: "origin-when-cross-origin"
	}
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">){
	const { locale } = await params

	return (
		<html lang={hasLocale(routing.locales, locale) ? locale : routing.defaultLocale}>
			<body className={`${poppins.className} min-h-dvh bg-page text-content`}>
				<NextIntlClientProvider>
					<header className="flex justify-end px-2 pt-2 sm:px-4">
						<LanguageSwitcher />
					</header>

					{children}
				</NextIntlClientProvider>
			</body>
		</html>
	)
}
