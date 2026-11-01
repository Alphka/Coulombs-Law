import { useTranslations } from "next-intl"
import { Link } from "@i18n/navigation"

export default function NotFound(){
	const t = useTranslations()

	return (
		<main className="flex flex-col items-center gap-4 px-4 py-16 text-center">
			<h1 className="text-3xl font-bold">
				{t("notFound.title")}
			</h1>

			<p>
				{t("notFound.description")}
			</p>

			<Link
				href="/"
				className="rounded-lg bg-accent px-6 py-2 font-semibold text-on-accent transition-colors hover:brightness-110"
			>
				{t("notFound.home")}
			</Link>
		</main>
	)
}
