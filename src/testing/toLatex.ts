import type { MathNode, MathRow } from "@helpers/math"

const SYMBOLS: Record<string, string> = {
	"×": String.raw`\times`,
	"−": "-",
	"⋅": String.raw`\cdot`
}

function nodeToLatex(node: MathNode): string{
	switch(node.type){
		case "mn":
		case "mi":
		case "mo": return SYMBOLS[node.text] ?? node.text
		case "mtext": return node.text
		case "mspace": return String.raw`\ `
		case "mfrac": return String.raw`\dfrac{${toLatex(node.numerator)}}{${toLatex(node.denominator)}}`
		case "msup": return `${toLatex(node.base)}^{${toLatex(node.exponent)}}`
		case "msqrt": return String.raw`\sqrt{${toLatex(node.radicand)}}`
	}
}

/** The LaTeX of a row, which is how the steps were written before they became MathML */
export default function toLatex(row: MathRow): string{
	return row.map((node) => nodeToLatex(node)).join(" ")
}
