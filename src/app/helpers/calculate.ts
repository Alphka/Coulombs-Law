import type { CalculatorId, IField } from "@app/constants"
import type { MathRow } from "./math"
import { equals, formatNumber, formatSquareRoot, frac, mi, mn, mo, parentheses, power, product, space, sqrt, unit } from "./math"
import { CALCULATORS, CONSTANT_MAX, CONSTANT_MIN } from "@app/constants"
import CalculationError from "@entities/CalculationError"
import parseNumber from "./parseNumber"
import Fraction from "fraction.js"

export interface ICalculation {
	/** Each step, from the formula to the final result */
	steps: MathRow[]
}

type Values = Record<IField["name"], Fraction>

const DECIMAL_PLACES = new Fraction(1_000_000_000n, 1n)

/** The square of a number, with parentheses only when needed (negative numbers and powers of ten) */
function squared(value: Fraction): MathRow{
	const row = formatNumber(value)
	const needsParentheses = row.some((node) => node.type === "msup" || (node.type === "mo" && node.text === "−"))

	return [power(needsParentheses ? parentheses(row) : row, [mn("2")])]
}

function parseConstant(value: string){
	const coefficient = parseNumber(value, "constant")

	if(coefficient.lt(CONSTANT_MIN) || coefficient.gt(CONSTANT_MAX)){
		throw new CalculationError("constantRange", "constant")
	}

	return coefficient.mul(DECIMAL_PLACES)
}

function calculateForce(constant: Fraction, { distance, charge1, charge2 }: Values): ICalculation{
	const distanceSquared = distance.mul(distance)
	const charges = charge1.mul(charge2)
	const numerator = charges.mul(constant)
	const force = numerator.div(distanceSquared)

	const left: MathRow = [mi("F"), equals]

	return {
		steps: [
			[...left, frac(product(formatNumber(constant), formatNumber(charge1), formatNumber(charge2)), squared(distance))],
			[...left, frac(product(formatNumber(constant), formatNumber(charges)), formatNumber(distanceSquared))],
			[...left, frac(formatNumber(numerator), formatNumber(distanceSquared))],
			[...left, ...formatNumber(force), space, unit("N")]
		]
	}
}

function calculateCharge(constant: Fraction, { distance, charge2, force }: Values): ICalculation{
	const distanceSquared = distance.mul(distance)
	const numerator = force.mul(distanceSquared)
	const denominator = constant.mul(charge2)
	const charge = numerator.div(denominator)

	const left: MathRow = [mi("q"), equals]

	return {
		steps: [
			[...formatNumber(force), equals, ...formatNumber(constant), mo("×"), frac(product([mi("q")], formatNumber(charge2)), squared(distance))],
			[frac(formatNumber(force), formatNumber(constant)), equals, frac(product([mi("q")], formatNumber(charge2)), formatNumber(distanceSquared))],
			[...left, frac(product(formatNumber(force), formatNumber(distanceSquared)), product(formatNumber(constant), formatNumber(charge2)))],
			[...left, frac(formatNumber(numerator), formatNumber(denominator))],
			[...left, ...formatNumber(charge), space, unit("C")]
		]
	}
}

function calculateDistance(constant: Fraction, { charge1, charge2, force }: Values): ICalculation{
	const charges = charge1.mul(charge2)
	const numerator = charges.mul(constant)
	const distanceSquared = numerator.div(force)

	const left: MathRow = [mi("d"), mo("=")]
	const squaredLeft: MathRow = [power([mi("d")], [mn("2")]), equals]

	return {
		steps: [
			[...formatNumber(force), equals, frac(product(formatNumber(constant), formatNumber(charge1), formatNumber(charge2)), [power([mi("d")], [mn("2")])])],
			[...squaredLeft, frac(product(formatNumber(constant), formatNumber(charges)), formatNumber(force))],
			[...squaredLeft, frac(formatNumber(numerator), formatNumber(force))],
			[...left, sqrt(formatNumber(distanceSquared))],
			[...left, ...formatSquareRoot(distanceSquared), space, unit("m")]
		]
	}
}

const CALCULATE_BY_ID = {
	force: calculateForce,
	charge: calculateCharge,
	distance: calculateDistance
} satisfies Record<CalculatorId, (constant: Fraction, values: Values) => ICalculation>

/**
 * Finds the quantity that is missing from the calculator, showing every step.
 * Charges are used as magnitudes (absolute values), so the force is the magnitude of the force.
 *
 * @throws {CalculationError} When a value is invalid; its `field` is the one to correct.
 */
export default function calculate(id: CalculatorId, constantValue: string, values: Partial<Record<IField["name"], string>>): ICalculation{
	const calculator = CALCULATORS.find((item) => item.id === id)!
	const constant = parseConstant(constantValue)

	const parsed = Object.fromEntries(calculator.fields.map(({ name }) => {
		const value = parseNumber(values[name] ?? "", name)
		return [name, name.startsWith("charge") ? value.abs() : value]
	})) as Values

	if(id !== "distance" && parsed.distance.compare(0) <= 0){
		throw new CalculationError("distanceNotPositive", "distance")
	}

	if(id === "charge" && parsed.force.compare(0) < 0){
		throw new CalculationError("forceNegative", "force")
	}

	if(id === "charge" && parsed.charge2.n === 0n){
		throw new CalculationError("chargeZero", "charge2")
	}

	if(id === "distance" && parsed.force.compare(0) <= 0){
		throw new CalculationError("forceNotPositive", "force")
	}

	return CALCULATE_BY_ID[id](constant, parsed)
}
