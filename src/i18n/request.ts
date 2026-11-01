import { hasLocale, IntlErrorCode } from "next-intl"
import { getRequestConfig } from "next-intl/server"
import { routing } from "./routing"
import * as rootParams from "next/root-params"

export default getRequestConfig(async () => {
	const localeParameter = await rootParams.locale()
	const locale = hasLocale(routing.locales, localeParameter) ? localeParameter : routing.defaultLocale

	return {
		locale,
		messages: (await import(`../../messages/${locale}.json`)).default,
		onError(error){
			if(error.code === IntlErrorCode.MISSING_MESSAGE){
				console.error(error)
			}
		}
	}
})
