import type Fraction from "fraction.js"
import { SIGNIFICANT_DIGITS } from "@app/constants"

/** A small subset of MathML, rendered by the `MathView` component */
export type MathNode =
	| { type: "mn" | "mi" | "mo" | "mtext"; text: string }
	| { type: "mfrac"; numerator: MathRow; denominator: MathRow }
	| { type: "msup"; base: MathRow; exponent: MathRow }
	| { type: "msqrt"; radicand: MathRow }
	| { type: "mspace" }

export type MathRow = MathNode[]

export const mn = (text: string): MathNode => ({ type: "mn", text })
export const mi = (text: string): MathNode => ({ type: "mi", text })
export const mo = (text: string): MathNode => ({ type: "mo", text })

/** A short space, such as the one between a number and its unit */
export const space: MathNode = { type: "mspace" }

/** A unit, written upright */
export const unit = (text: string): MathNode => ({ type: "mtext", text })

export const equals = mo("=")

export const frac = (numerator: MathRow, denominator: MathRow): MathNode => ({ type: "mfrac", numerator, denominator })
export const power = (base: MathRow, exponent: MathRow): MathNode => ({ type: "msup", base, exponent })
export const sqrt = (radicand: MathRow): MathNode => ({ type: "msqrt", radicand })

export function parentheses(row: MathRow): MathRow{
	return [mo("("), ...row, mo(")")]
}

/** Joins the rows with the multiplication sign: `a × b × c` */
export function product(...rows: MathRow[]): MathRow{
	return rows.flatMap((row, index) => index === 0 ? row : [mo("×"), ...row])
}

/** The integer square root (rounded down) of a non-negative integer, by Newton's method */
function integerSquareRoot(value: bigint){
	if(value < 2n) return value

	let root = 1n << BigInt((value.toString(2).length + 1) >> 1)

	for(;;){
		const next = (root + value / root) >> 1n

		if(next >= root) return root

		root = next
	}
}

/**
 * Splits the square root of a positive number into `digits` significant digits and a decimal exponent when
 * `squareRoot` is set, or the number itself otherwise. Rounds half up and only uses integers, so it is exact.
 */
function splitSignificant(value: Fraction, precision: number, squareRoot: boolean){
	const low = 10n ** BigInt(precision - 1)
	const high = low * 10n

	// Within one of the real exponent, which the loop below corrects
	const estimate = value.n.toString().length - value.d.toString().length
	let exponent = squareRoot ? Math.floor(estimate / 2) : estimate

	for(;;){
		// Scaling the root by 10^shift scales the number by 10^(2 * shift)
		const shift = precision - 1 - exponent
		const scale = 10n ** BigInt(Math.abs(squareRoot ? shift * 2 : shift))
		const numerator = shift >= 0 ? value.n * scale : value.n
		const denominator = shift >= 0 ? value.d : value.d * scale

		let digits = squareRoot ? integerSquareRoot(numerator / denominator) : numerator / denominator

		if(digits < low){
			exponent--
			continue
		}

		if(digits >= high){
			exponent++
			continue
		}

		// The root rounds up when (digits + 1/2)² is not above the number
		const twice = 2n * digits + 1n
		const roundUp = squareRoot ? twice * twice * denominator <= 4n * numerator : (numerator % denominator) * 2n >= denominator

		if(roundUp) digits++

		if(digits === high){
			digits = low
			exponent++
		}

		return { digits: digits.toString(), exponent }
	}
}

/**
 * Splits a positive number into `digits` significant digits and a decimal exponent, rounding half up:
 * the value is `d.ddd × 10^exponent`.
 */
export function toScientific(value: Fraction, precision = SIGNIFICANT_DIGITS){
	return splitSignificant(value, precision, false)
}

/** Like `toScientific`, for the square root of a positive number */
export function toScientificSquareRoot(value: Fraction, precision = SIGNIFICANT_DIGITS){
	return splitSignificant(value, precision, true)
}

/** Numbers with an exponent in this range are written as plain decimals */
const PLAIN_MIN_EXPONENT = -3
const PLAIN_MAX_EXPONENT = 3

/** `digits` is the significant digits, `exponent` is the decimal exponent of the first one */
export function formatScientific(digits: string, exponent: number): MathRow{
	const trimmed = digits.replace(/0+$/, "") || "0"

	if(exponent >= PLAIN_MIN_EXPONENT && exponent <= PLAIN_MAX_EXPONENT){
		if(exponent < 0) return [mn(`0.${"0".repeat(-exponent - 1)}${trimmed}`)]

		const integer = trimmed.slice(0, exponent + 1).padEnd(exponent + 1, "0")
		const decimals = trimmed.slice(exponent + 1)

		return [mn(decimals ? `${integer}.${decimals}` : integer)]
	}

	const mantissa = trimmed.length > 1 ? `${trimmed[0]}.${trimmed.slice(1)}` : trimmed
	const exponentRow = exponent < 0 ? [mo("−"), mn(String(-exponent))] : [mn(String(exponent))]

	return [mn(mantissa), mo("×"), power([mn("10")], exponentRow)]
}

export function formatNumber(value: Fraction): MathRow{
	if(value.n === 0n) return [mn("0")]

	const { digits, exponent } = toScientific(value.abs())
	const row = formatScientific(digits, exponent)

	return value.s < 0n ? [mo("−"), ...row] : row
}

/** The square root of a positive number, with the same number of digits as the other numbers */
export function formatSquareRoot(value: Fraction): MathRow{
	if(value.n === 0n) return [mn("0")]

	const { digits, exponent } = toScientificSquareRoot(value)

	return formatScientific(digits, exponent)
}
