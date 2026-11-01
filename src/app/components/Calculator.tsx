"use client"

import type { CalculatorId } from "@app/constants"
import type { FieldValues } from "./CalculatorForm"
import type { ResultState } from "./Result"
import type { FieldName } from "@entities/CalculationError"
import { CALCULATORS, CONSTANT_DEFAULT, CONSTANT_MAX, CONSTANT_MIN, MAX_EXPONENT } from "@app/constants"
import { useTranslations } from "next-intl"
import { useState } from "react"
import CalculationError from "@entities/CalculationError"
import CalculatorForm from "./CalculatorForm"
import ConstantField from "./ConstantField"
import calculate from "@helpers/calculate"
import Result from "./Result"
import Tabs from "./Tabs"

const PANEL_ID = "calculator-panel"

export default function Calculator(){
	const [invalidField, setInvalidField] = useState<FieldName>()
	const [activeId, setActiveId] = useState<CalculatorId>(CALCULATORS[0].id)
	const [constant, setConstant] = useState(CONSTANT_DEFAULT)
	const [result, setResult] = useState<ResultState>()
	const t = useTranslations()

	const calculator = CALCULATORS.find(({ id }) => id === activeId)!

	function selectTab(id: CalculatorId){
		if(id === activeId) return

		setActiveId(id)
		setInvalidField(undefined)
		setResult(undefined)
	}

	function handleConstantChange(value: string){
		setConstant(value)
		setInvalidField(undefined)
	}

	function handleSubmit(values: FieldValues){
		try{
			setInvalidField(undefined)
			setResult({ type: "steps", calculation: calculate(activeId, constant, values) })
		}catch(error){
			if(!(error instanceof CalculationError)){
				console.error(error)
				setResult({ type: "error", message: t("errors.unexpected") })
				return
			}

			setInvalidField(error.field)
			setResult({
				type: "error",
				message: t(`errors.${error.code}`, {
					field: t(`fields.${error.field}`),
					min: CONSTANT_MIN,
					max: CONSTANT_MAX,
					limit: MAX_EXPONENT
				})
			})

			document.getElementById(error.field)?.focus()
		}
	}

	return (
		<div className="flex w-full flex-col gap-4">
			<ConstantField
				value={constant}
				invalid={invalidField === "constant"}
				onChange={handleConstantChange}
			/>

			<section className="flex flex-col gap-3 border-t border-raised pt-4" aria-labelledby="calculator-select">
				<h2 id="calculator-select" className="text-center">
					{t("calculator.select")}
				</h2>

				<Tabs
					label={t("calculator.select")}
					items={CALCULATORS.map(({ id }) => ({ id, label: t(`calculator.tabs.${id}`) }))}
					activeId={activeId}
					panelId={PANEL_ID}
					onChange={selectTab}
				/>

				<div className="min-h-52 rounded-md border border-outline bg-surface px-2 py-5">
					<CalculatorForm
						calculator={calculator}
						invalidField={invalidField}
						panelId={PANEL_ID}
						onSubmit={handleSubmit}
						onInput={() => setInvalidField(undefined)}
						key={activeId}
					/>

					<Result result={result} />
				</div>
			</section>
		</div>
	)
}
