import type { Messages } from "next-intl"

export type CalculationErrorCode = Exclude<keyof Messages["errors"], "unexpected">

export type FieldName = "constant" | "force" | "charge1" | "charge2" | "distance"

export default class CalculationError extends Error {
	readonly code: CalculationErrorCode
	readonly field: FieldName

	constructor(code: CalculationErrorCode, field: FieldName){
		super(`${code}: ${field}`)

		this.name = "CalculationError"
		this.code = code
		this.field = field
	}
}
