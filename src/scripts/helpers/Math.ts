function GetExponential(a: number, b: number){
	const min = Math.min(a, b)
	return Math.abs(+min.toExponential().split("e")[1]) + 1
}

function TransformNumbers(a: number, b: number, exponential?: number){
	exponential ??= GetExponential(a, b)

	const [aBase, aExp] = a.toExponential().split("e").map(Number)
	const [bBase, bExp] = b.toExponential().split("e").map(Number)

	return [
		a = aBase * 10 ** (aExp + exponential),
		b = bBase * 10 ** (bExp + exponential)
	]
}

function Sum(a: number, b: number){
	if(a % 1 + b % 1 === 0) return a + b

	const exponential = GetExponential(a, b)

	;[a, b] = TransformNumbers(a, b, exponential)

	return (a + b) / 10 ** exponential
}

function Divide(a: number, b: number){
	[a, b] = TransformNumbers(a, b)

	const result = a / b
	return a > 0 && b > 0 ? +result.toPrecision(12) : result
}

function Multiply(a: number, b: number){
	if(a % 1 + b % 1 === 0) return a * b

	const exponential = GetExponential(a, b)

	;[a, b] = TransformNumbers(a, b, exponential)

	return (a * b) / 10 ** (exponential * 2)
}

function Sqrt(number: number){
	const sqrt = Math.sqrt(number)

	if(sqrt % 1 === 0) return {
		result: sqrt.toExponential().split("e").map(Number).join("e"), // Remove + sign
		result_number: sqrt
	}

	let [base, exp] = number.toExponential().split("e").map(Number)

	if(exp % 2 !== 0){
		base *= 10
		exp -= 1
	}

	const secondSqrt = Math.sqrt(base)

	return {
		result: +secondSqrt.toPrecision(12) + "e" + (exp / 2),
		result_number: sqrt
	}
}

const Chain = (value: number) => {
	const object = { divide, sum, multiply, done }

	function divide(number: number){
		value = Divide(value, number)
		return object
	}

	function sum(number: number){
		value = Sum(value, number)
		return object
	}

	function multiply(number: number){
		value = Multiply(value, number)
		return object
	}

	function done(){
		return value
	}

	return object
}

export {
	GetExponential,
	Sum,
	Divide,
	Multiply,
	Sqrt,
	Chain
}
