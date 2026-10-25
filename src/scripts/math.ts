export function getExponential(a: number, b: number){
	const min = Math.min(a, b)
	return Math.abs(+min.toExponential().split("e")[1]!) + 1
}

function transformNumbers(a: number, b: number, exponential = getExponential(a, b)): [number, number]{
	const [aBase, aExp] = a.toExponential().split("e").map(Number) as [number, number]
	const [bBase, bExp] = b.toExponential().split("e").map(Number) as [number, number]

	return [
		aBase * 10 ** (aExp + exponential),
		bBase * 10 ** (bExp + exponential)
	]
}

export function divide(a: number, b: number){
	;[a, b] = transformNumbers(a, b)

	const result = a / b
	return a > 0 && b > 0 ? +result.toPrecision(12) : result
}

export function multiply(a: number, b: number){
	if(a % 1 + b % 1 === 0) return a * b

	const exponential = getExponential(a, b)

	;[a, b] = transformNumbers(a, b, exponential)

	return (a * b) / 10 ** (exponential * 2)
}

export function sqrt(number: number){
	const result = Math.sqrt(number)

	if(result % 1 === 0) return {
		// Remove the + sign
		text: result.toExponential().split("e").map(Number).join("e"),
		value: result
	}

	let [base, exp] = number.toExponential().split("e").map(Number) as [number, number]

	if(exp % 2 !== 0){
		base *= 10
		exp -= 1
	}

	return {
		text: +Math.sqrt(base).toPrecision(12) + "e" + (exp / 2),
		value: result
	}
}
