import { getTranslations } from "next-intl/server"
import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"
import { routing } from "@i18n/routing"
import Calculator from "@components/Calculator"

export default async function Home({ params }: PageProps<"/[locale]">){
	const { locale } = await params

	if(!hasLocale(routing.locales, locale)) notFound()

	const t = await getTranslations()

	return (
		<main className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-2 py-6 sm:px-4 md:pt-10">
			<h1 className="border-b border-raised pb-5 text-center text-2xl font-bold sm:text-3xl w-full">
				{t("calculator.title")}
			</h1>

			<Calculator />
		</main>
	)
}
