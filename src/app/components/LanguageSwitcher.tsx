import { useLocale, useTranslations } from "next-intl"
import { routing } from "@i18n/routing"
import { Link } from "@i18n/navigation"

export default function LanguageSwitcher(){
	const currentLocale = useLocale()
	const t = useTranslations()

	return (
		<nav aria-label={t("languageSwitcher.label")}>
			<ul className="flex gap-1 rounded-lg border border-outline bg-raised p-1 text-sm">
				{routing.locales.map((locale) => (
					<li key={locale}>
						<Link
							href="/"
							lang={locale}
							locale={locale}
							hrefLang={locale}
							className="block rounded-md px-3 py-1 transition-colors hover:bg-surface aria-[current=page]:bg-accent aria-[current=page]:font-semibold aria-[current=page]:text-on-accent"
							aria-current={locale === currentLocale ? "page" : undefined}
						>
							{t(`languageSwitcher.${locale}`)}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	)
}
