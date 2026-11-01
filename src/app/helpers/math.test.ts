import { formatNumber, formatSquareRoot, toScientific, toScientificSquareRoot } from "./math"
import Fraction from "fraction.js"
import toLatex from "@testing/toLatex"

const fraction = (numerator: number, denominator = 1) => new Fraction(numerator, denominator)

describe("toScientific", () => {
	it.each([
		[fraction(1), "100000000000", 0],
		[fraction(12_345), "123450000000", 4],
		[fraction(1, 3), "333333333333", -1],
		[fraction(2, 3), "666666666667", -1],
		[fraction(1, 1000), "100000000000", -3],
		[fraction(9_999_999_999_995, 10), "100000000000", 12]
	])("splits %s", (value, digits, exponent) => {
		expect(toScientific(value)).toEqual({ digits, exponent })
	})
})

describe("formatNumber", () => {
	it.each([
		[fraction(0), "0"],
		[fraction(12), "12"],
		[fraction(1225, 100), "12.25"],
		[fraction(1, 2), "0.5"],
		[fraction(1, 1000), "0.001"],
		[fraction(1, 10_000), String.raw`1 \times 10^{- 4}`],
		[fraction(1234), "1234"],
		[fraction(12_345), String.raw`1.2345 \times 10^{4}`],
		[fraction(-3), "- 3"],
		[fraction(-1, 10_000), String.raw`- 1 \times 10^{- 4}`],
		[fraction(1, 3), "0.333333333333"],
		[new Fraction(10n ** 30n, 1n), String.raw`1 \times 10^{30}`]
	])("writes %s", (value, latex) => {
		expect(toLatex(formatNumber(value))).toBe(latex)
	})
})

describe("formatSquareRoot", () => {
	it.each([
		[fraction(4), "2"],
		[fraction(9, 100), "0.3"],
		[fraction(2), "1.41421356237"],
		[fraction(200), "14.1421356237"],
		[new Fraction(10n ** 20n, 1n), String.raw`1 \times 10^{10}`],
		[new Fraction(2n * 10n ** 21n, 1n), String.raw`4.472135955 \times 10^{10}`],
		// Rounding in floating point (the old implementation) gave a wrong last digit for these two
		[new Fraction(125_441_330_361_099_306_420_934_820n, 3_865_252_951n), String.raw`1.80148796622 \times 10^{8}`],
		[new Fraction(1_292_875_250_749n, 557_867_018_904_607_020_675_268_736_039_956_667_740n), String.raw`4.8140762816 \times 10^{- 14}`],
		// Rounds up to the next power of ten
		[new Fraction(99_999_999_999_999_999_999n, 10n ** 18n), "10"]
	])("writes the root of %s", (value, latex) => {
		expect(toLatex(formatSquareRoot(value))).toBe(latex)
	})
})

describe("toScientificSquareRoot", () => {
	it.each([
		[fraction(4), "200000000000", 0],
		[fraction(2), "141421356237", 0],
		[fraction(200), "141421356237", 1],
		[fraction(1, 4), "500000000000", -1],
		[fraction(1, 100_000), "316227766017", -3]
	])("splits the root of %s", (value, digits, exponent) => {
		expect(toScientificSquareRoot(value)).toEqual({ digits, exponent })
	})
})
