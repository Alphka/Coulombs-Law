import { CONSTANT_MAX, CONSTANT_MIN, CONSTANT_SUGGESTIONS } from "@app/constants"
import { frac, mn, mo, power, unit } from "@helpers/math"
import { useTranslations } from "next-intl"
import { useRef } from "react"
import MathView from "./MathView"

const UNIT_ROW = [
	mo("×"),
	power([mn("10")], [mn("9")]),
	frac(
		[unit("N"), mo("⋅"), power([unit("m")], [mn("2")])],
		[power([unit("C")], [mn("2")])]
	)
]

interface IConstantFieldProps {
	onChange: (value: string) => void
	invalid?: boolean
	value: string
}

export default function ConstantField({ onChange, invalid, value }: IConstantFieldProps){
	const t = useTranslations()

	// Selects the whole value on the first click, so the next click can place the cursor
	const wasFocused = useRef(false)

	return (
		<div className="flex flex-col items-center gap-1">
			<label htmlFor="constant">
				{t("fields.constant")}
			</label>

			<div className="flex items-center gap-2">
				<input
					id="constant"
					name="constant"
					type="number"
					min={CONSTANT_MIN}
					max={CONSTANT_MAX}
					step="any"
					list="constants"
					value={value}
					aria-invalid={invalid || undefined}
					className="w-20 border-b border-outline bg-transparent pe-2 text-right aria-invalid:border-danger"
					onChange={(event) => onChange(event.target.value)}
					onPointerDown={(event) => (wasFocused.current = document.activeElement === event.currentTarget)}
					onClick={(event) => {
						if(!wasFocused.current){
							event.currentTarget.select()
						}
					}}
				/>

				<MathView row={UNIT_ROW} display="inline" />
			</div>

			<datalist id="constants">
				{CONSTANT_SUGGESTIONS.map((suggestion) => (
					<option key={suggestion} value={suggestion} />
				))}
			</datalist>
		</div>
	)
}
