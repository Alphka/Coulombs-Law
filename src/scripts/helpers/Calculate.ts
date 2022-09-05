import { Chain, Divide, Multiply, Sqrt } from "./Math"

declare var math: typeof import("mathjs")

function isNumber(number: any, mustBeFinite: boolean = true){
	if(number === 0) return true
	if(!number) return false

	if(typeof number !== "number") number = Number(number)

	if(!Number.isNaN(number)){
		if(mustBeFinite) return Number.isFinite(number)
		return true
	}

	return false
}

function ToLatex(value: number | string){
	if(typeof value === "number") value = value.toExponential()

	const [base, exponential] = value.split("e").map(Number) as [number, number]

	if(exponential >= 0 && exponential <= 3) return Number(value).toString()

	return `${+base.toExponential(12)} \\times 10^{${exponential}}`
}

export default class Calculate {
	private chain!: number
	public result!: number
	public steps = new Array<string>()

	private GetConstant(value: string){
		const result = Number(value)

		if(!/^[\d.]+$/.test(value.trim())) throw "Invalid value for constant"
		if(result < 8.9 || result > 9) throw "Invalid range for constant"

		return result * 10**9
	}
	private GetForce(value: string){
		return Number(value)
	}
	private GetCharge(value: string){
		return Math.abs(Number(value))
	}
	private GetDistance(value: string){
		const result = Number(value)

		if(result === 0) throw "Distance cannot be zero"

		return result
	}
	Force(constant: string | number, charge1: string | number, charge2: string | number, distance: string | number){
		if(typeof constant === "string") constant = this.GetConstant(constant)
		if(typeof charge1 === "string") charge1 = this.GetCharge(charge1)
		if(typeof charge2 === "string") charge2 = this.GetCharge(charge2)
		if(typeof distance === "string") distance = this.GetDistance(distance)

		if(!isNumber(constant)) throw `constant is not a number (${constant})`
		if(!isNumber(charge1)) throw `charge1 is not a number (${charge1})`
		if(!isNumber(charge2)) throw `charge2 is not a number (${charge2})`
		if(!isNumber(distance)) throw `distance is not a number (${distance})`

		const distanceSquared = distance ** 2

		this.steps.push(`F = \\dfrac{${ToLatex(constant)} \\times ${ToLatex(charge1)} \\times ${ToLatex(charge2)}}{(${ToLatex(distance)})^{2}}`)
		this.steps.push(`F = \\dfrac{${ToLatex(constant)} \\times ${ToLatex(this.chain = Multiply(charge1, charge2))}}{${ToLatex(distanceSquared)}}`)
		this.steps.push(`F = \\dfrac{${ToLatex(this.chain = Multiply(this.chain, constant))}}{${ToLatex(distanceSquared)}}`)
		this.steps.push(`F = ${ToLatex(this.chain = Divide(this.chain, distanceSquared))}\\ N`)

		return this.result = this.chain
	}
	Charge(constant: string | number, force: string | number, charge2: string | number, distance: string | number){
		if(typeof constant === "string") constant = this.GetConstant(constant)
		if(typeof force === "string") force = this.GetForce(force)
		if(typeof charge2 === "string") charge2 = this.GetCharge(charge2)
		if(typeof distance === "string") distance = this.GetDistance(distance)

		if(!isNumber(constant)) throw `constant is not a number (${constant})`
		if(!isNumber(force)) throw `force is not a number (${force})`
		if(!isNumber(charge2)) throw `charge2 is not a number (${charge2})`
		if(!isNumber(distance)) throw `distance is not a number (${distance})`

		const distanceSquared = distance ** 2
		let secondChain: number

		this.steps.push(`${ToLatex(force)} = ${ToLatex(constant)} \\times \\dfrac{q \\times ${ToLatex(charge2)}}{(${ToLatex(distance)})^{2}}`)
		this.steps.push(`\\dfrac{${ToLatex(force)}}{${ToLatex(constant)}} = \\dfrac{q \\times ${ToLatex(charge2)}}{${ToLatex(distanceSquared)}}`)
		this.steps.push(`q = \\dfrac{${ToLatex(force)} \\times ${ToLatex(distanceSquared)}}{${ToLatex(constant)} \\times ${ToLatex(charge2)}}`)
		this.steps.push(`q = \\dfrac{${ToLatex(this.chain = Multiply(force, distanceSquared))}}{${ToLatex(secondChain = Multiply(constant, charge2))}}`)
		this.steps.push(`q = \\dfrac{${ToLatex(this.chain)}}{${ToLatex(secondChain)}}`)
		this.steps.push(`q = ${ToLatex(this.chain = Divide(this.chain, secondChain))}\\ C`)

		return this.result = this.chain
	}
	Distance(constant: string | number, force: string | number, charge1: string | number, charge2: string | number){
		if(typeof constant === "string") constant = this.GetConstant(constant)
		if(typeof force === "string") force = this.GetForce(force)
		if(typeof charge1 === "string") charge1 = this.GetCharge(charge1)
		if(typeof charge2 === "string") charge2 = this.GetCharge(charge2)

		if(!isNumber(constant)) throw `constant is not a number (${constant})`
		if(!isNumber(force)) throw `force is not a number (${force})`
		if(!isNumber(charge1)) throw `charge1 is not a number (${charge1})`
		if(!isNumber(charge2)) throw `charge2 is not a number (${charge2})`

		this.steps.push(`${ToLatex(force)} = \\dfrac{${ToLatex(constant)} \\times ${ToLatex(charge1)} \\times ${ToLatex(charge2)}}{d^{2}}`)
		this.steps.push(`d^{2} = \\dfrac{${ToLatex(constant)} \\times ${ToLatex(this.chain = Multiply(charge1, charge2))}}{${ToLatex(force)}}`)
		this.steps.push(`d^{2} = \\dfrac{${ToLatex(this.chain = Multiply(this.chain, constant))}}{${ToLatex(force)}}`)
		this.steps.push(`d = \\sqrt{${ToLatex(this.chain = Divide(this.chain, force))}}`)

		const squareRoot = Sqrt(this.chain)
		const { result, result_number } = squareRoot

		this.steps.push(`d = ${ToLatex(result)}\\ m`)
		this.result = result_number

		return squareRoot
	}
}
