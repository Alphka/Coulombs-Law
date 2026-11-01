import type { ICalculation } from "@helpers/calculate"
import { useTranslations } from "next-intl"
import MathView from "./MathView"

export type ResultState =
	| { type: "steps"; calculation: ICalculation }
	| { type: "error"; message: string }

interface IResultProps {
	result?: ResultState
}

/** The live region is always rendered, so screen readers announce what is put inside it */
export default function Result({ result }: IResultProps){
	const t = useTranslations()

	return (
		<div
			role="status"
			aria-label={t("calculator.result")}
			className="mt-4 flex flex-col gap-4 empty:mt-0"
		>
			{result?.type === "steps" && result.calculation.steps.map((step, index) => (
				<div key={index} className="overflow-x-auto overflow-y-hidden text-center text-[clamp(0.8rem,0.55rem+1.2vw,1.2rem)]">
					<MathView row={step} />
				</div>
			))}

			{result?.type === "error" && (
				<p className="text-center text-danger">
					{result.message}
				</p>
			)}
		</div>
	)
}
