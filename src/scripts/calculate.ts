import { divide, multiply, sqrt } from "./math"

export interface Calculation {
	/** LaTeX of each step, from the formula to the final result */
	steps: string[]
	result: number
}

/** An error whose message can be shown to the user */
export class CalculationError extends Error {
	override name = "CalculationError"
}

const numberPattern = /^[-+]?\d+(\.\d+)?(e[-+]?\d+)?$|^\.\d+$/

/** Same validation the form applies before calculating */
export function isValidNumber(value: string){
	return numberPattern.test(value)
}

function isNumber(value: number){
	return Number.isFinite(value)
}

function toLatex(value: number | string){
	if(typeof value === "number") value = value.toExponential()

	const [base, exponential] = value.split("e").map(Number) as [number, number]

	if(exponential >= 0 && exponential <= 3) return Number(value).toString()

	return `${+base.toExponential(12)} \\times 10^{${exponential}}`
}

/** LaTeX of `value²`, with parentheses only when needed (negative numbers and powers of ten) */
function squared(value: number){
	const latex = toLatex(value)

	return /[-\\]/.test(latex) ? `(${latex})^{2}` : `${latex}^{2}`
}

/** Guards every intermediate value: an overflow would otherwise be printed as "Infinity × 10^{NaN}" */
function finite(value: number){
	if(!isNumber(value)) throw new CalculationError("The result is out of range")
	return value
}

function parseConstant(value: string){
	const result = Number(value)

	if(!/^[\d.]+$/.test(value.trim())) throw new CalculationError("Invalid value for constant")
	if(result < 8.9 || result > 9) throw new CalculationError("Invalid range for constant")

	return result * 10 ** 9
}

function parseCharge(value: string){
	return Math.abs(Number(value))
}

function parseDistance(value: string){
	const result = Number(value)

	if(result === 0) throw new CalculationError("Distance cannot be zero")

	return result
}

function assertNumber(value: number, name: string){
	if(!isNumber(value)) throw new CalculationError(`${name} is not a number (${value})`)
}

export function calculateForce(constantValue: string, charge1Value: string, charge2Value: string, distanceValue: string): Calculation{
	const constant = parseConstant(constantValue)
	const charge1 = parseCharge(charge1Value)
	const charge2 = parseCharge(charge2Value)
	const distance = parseDistance(distanceValue)

	assertNumber(charge1, "charge1")
	assertNumber(charge2, "charge2")
	assertNumber(distance, "distance")

	const distanceSquared = finite(distance ** 2)
	const steps: string[] = []

	let chain = finite(multiply(charge1, charge2))

	steps.push(`F = \\dfrac{${toLatex(constant)} \\times ${toLatex(charge1)} \\times ${toLatex(charge2)}}{${squared(distance)}}`)
	steps.push(`F = \\dfrac{${toLatex(constant)} \\times ${toLatex(chain)}}{${toLatex(distanceSquared)}}`)
	steps.push(`F = \\dfrac{${toLatex(chain = finite(multiply(chain, constant)))}}{${toLatex(distanceSquared)}}`)
	steps.push(`F = ${toLatex(chain = finite(divide(chain, distanceSquared)))}\\ N`)

	return { steps, result: chain }
}

export function calculateCharge(constantValue: string, forceValue: string, charge2Value: string, distanceValue: string): Calculation{
	const constant = parseConstant(constantValue)
	const force = Number(forceValue)
	const charge2 = parseCharge(charge2Value)
	const distance = parseDistance(distanceValue)

	assertNumber(force, "force")
	assertNumber(charge2, "charge2")
	assertNumber(distance, "distance")

	if(charge2 === 0) throw new CalculationError("Second charge cannot be zero")

	const distanceSquared = finite(distance ** 2)
	const steps: string[] = []

	const numerator = finite(multiply(force, distanceSquared))
	const denominator = finite(multiply(constant, charge2))

	steps.push(`${toLatex(force)} = ${toLatex(constant)} \\times \\dfrac{q \\times ${toLatex(charge2)}}{${squared(distance)}}`)
	steps.push(`\\dfrac{${toLatex(force)}}{${toLatex(constant)}} = \\dfrac{q \\times ${toLatex(charge2)}}{${toLatex(distanceSquared)}}`)
	steps.push(`q = \\dfrac{${toLatex(force)} \\times ${toLatex(distanceSquared)}}{${toLatex(constant)} \\times ${toLatex(charge2)}}`)
	steps.push(`q = \\dfrac{${toLatex(numerator)}}{${toLatex(denominator)}}`)
	steps.push(`q = \\dfrac{${toLatex(numerator)}}{${toLatex(denominator)}}`)

	const result = finite(divide(numerator, denominator))

	steps.push(`q = ${toLatex(result)}\\ C`)

	return { steps, result }
}

export function calculateDistance(constantValue: string, forceValue: string, charge1Value: string, charge2Value: string): Calculation{
	const constant = parseConstant(constantValue)
	const force = Number(forceValue)
	const charge1 = parseCharge(charge1Value)
	const charge2 = parseCharge(charge2Value)

	assertNumber(force, "force")
	assertNumber(charge1, "charge1")
	assertNumber(charge2, "charge2")

	if(force <= 0) throw new CalculationError("Force must be greater than zero")

	const steps: string[] = []

	let chain = finite(multiply(charge1, charge2))

	steps.push(`${toLatex(force)} = \\dfrac{${toLatex(constant)} \\times ${toLatex(charge1)} \\times ${toLatex(charge2)}}{d^{2}}`)
	steps.push(`d^{2} = \\dfrac{${toLatex(constant)} \\times ${toLatex(chain)}}{${toLatex(force)}}`)
	steps.push(`d^{2} = \\dfrac{${toLatex(chain = finite(multiply(chain, constant)))}}{${toLatex(force)}}`)
	steps.push(`d = \\sqrt{${toLatex(chain = finite(divide(chain, force)))}}`)

	const { text, value } = sqrt(chain)

	steps.push(`d = ${toLatex(text)}\\ m`)

	return { steps, result: value }
}
