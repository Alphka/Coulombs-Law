import type { FieldName } from "@entities/CalculationError"
import { MAX_EXPONENT } from "@app/constants"
import CalculationError from "@entities/CalculationError"
import Fraction from "fraction.js"

const NUMBER_REGEX = /^(?<sign>[+\-]?)(?<mantissa>\d+(?:\.\d*)?|\.\d+)(?:e(?<exponent>[+\-]?\d+))?$/iv

/**
 * Parses a decimal number, with optional scientific notation (such as `3`, `.5`, `0,5` or `1.6e-19`),
 * into an exact fraction. A single comma is accepted as the decimal separator.
 * @throws {CalculationError} When the value is empty, is not a number, or its exponent is too large.
 */
export default function parseNumber(value: string, field: FieldName){
	const text = value.trim().replace(",", ".")

	if(!text) throw new CalculationError("missing", field)

	const groups = NUMBER_REGEX.exec(text)?.groups

	if(!groups) throw new CalculationError("invalid", field)

	const { sign, mantissa, exponent = "0" } = groups
	const exponentValue = Number(exponent)

	if(Math.abs(exponentValue) > MAX_EXPONENT) throw new CalculationError("exponent", field)

	const [integer, decimals = ""] = mantissa.split(".", 2)
	const digits = BigInt(integer + decimals || "0")
	const shift = exponentValue - decimals.length
	const scale = 10n ** BigInt(Math.abs(shift))
	const number = shift >= 0 ? new Fraction(digits * scale, 1n) : new Fraction(digits, scale)

	return sign === "-" ? number.neg() : number
}
