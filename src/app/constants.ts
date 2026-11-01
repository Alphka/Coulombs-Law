import type { FieldName } from "@entities/CalculationError"

export const BASE_URL = new URL("https://coulomb-law.vercel.app")

/** Coulomb's constant is entered as a coefficient of 10⁹ N·m²/C² */
export const CONSTANT_MIN = 8.9
export const CONSTANT_MAX = 9
export const CONSTANT_DEFAULT = "9"
export const CONSTANT_SUGGESTIONS = ["8.998", "8.99", "8.9", "9"] as const

/** Digits shown in the steps; keeps `10n ** exponent` small enough to compute instantly */
export const SIGNIFICANT_DIGITS = 12
export const MAX_EXPONENT = 1000

export type CalculatorId = "force" | "charge" | "distance"

export interface IField {
	name: Exclude<FieldName, "constant">
	unit: "C" | "N" | "m"
}

export interface ICalculator {
	id: CalculatorId
	fields: readonly [IField, IField, IField]
}

/** The calculators, in the order of the tabs. Each one finds the quantity that is not among its fields */
export const CALCULATORS = [
	{
		id: "force",
		fields: [
			{ name: "charge1", unit: "C" },
			{ name: "charge2", unit: "C" },
			{ name: "distance", unit: "m" }
		]
	},
	{
		id: "charge",
		fields: [
			{ name: "force", unit: "N" },
			{ name: "charge2", unit: "C" },
			{ name: "distance", unit: "m" }
		]
	},
	{
		id: "distance",
		fields: [
			{ name: "force", unit: "N" },
			{ name: "charge1", unit: "C" },
			{ name: "charge2", unit: "C" }
		]
	}
] as const satisfies readonly ICalculator[]
