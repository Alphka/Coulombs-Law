import type { ReactElement } from "react"
import { NextIntlClientProvider } from "next-intl"
import { render } from "@testing-library/react"
import messages from "../../messages/en.json"

export default function renderWithIntl(element: ReactElement){
	return render(
		<NextIntlClientProvider locale="en" messages={messages}>
			{element}
		</NextIntlClientProvider>
	)
}
