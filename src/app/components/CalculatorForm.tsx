import type { KeyboardEvent, SubmitEvent } from "react"
import type { ICalculator } from "@app/constants"
import type { FieldName } from "@entities/CalculationError"
import { useTranslations } from "next-intl"
import NumberField from "./NumberField"
import getTabId from "@helpers/getTabId"

export type FieldValues = Record<string, string>

interface ICalculatorFormProps {
	invalidField?: FieldName
	calculator: ICalculator
	onSubmit: (values: FieldValues) => void
	onInput: () => void
	panelId: string
}

/** The fields of one calculator. Enter moves to the next field and submits on the last one */
export default function CalculatorForm({
	invalidField,
	calculator: { id, fields },
	onSubmit,
	panelId,
	onInput
}: ICalculatorFormProps){
	const t = useTranslations()

	function handleSubmit(event: SubmitEvent<HTMLFormElement>){
		event.preventDefault()

		const data = new FormData(event.currentTarget)

		onSubmit(Object.fromEntries(fields.map(({ name }) => {
			const value = data.get(name)

			return [name, typeof value === "string" ? value : ""]
		})))
	}

	function handleKeyDown(event: KeyboardEvent<HTMLInputElement>){
		if(event.key !== "Enter") return

		const next = fields.findIndex(({ name }) => name === event.currentTarget.name) + 1
		const nextField = fields.at(next)

		if(!nextField) return

		event.preventDefault()
		document.getElementById(nextField.name)?.focus()
	}

	return (
		<form
			id={panelId}
			role="tabpanel"
			aria-labelledby={getTabId(id)}
			noValidate
			className="flex flex-col gap-2"
			onSubmit={handleSubmit}
		>
			{fields.map(({ name, unit }) => (
				<NumberField
					name={name}
					label={t(`fields.${name}`)}
					unit={unit}
					invalid={name === invalidField}
					required
					onInput={onInput}
					onKeyDown={handleKeyDown}
					key={name}
				/>
			))}

			<button
				type="submit"
				className="mx-auto mt-3 w-28 rounded-sm bg-accent py-1.5 font-semibold text-on-accent hover:brightness-110"
			>
				{t("calculator.submit")}
			</button>
		</form>
	)
}
