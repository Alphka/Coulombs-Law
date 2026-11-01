import type { DetailedHTMLProps, HTMLAttributes } from "react"

type MathMLProps = DetailedHTMLProps<HTMLAttributes<MathMLElement>, MathMLElement>

declare module "react" {
	namespace JSX {
		interface IntrinsicElements {
			mi: MathMLProps
			mn: MathMLProps
			mo: MathMLProps
			math: MathMLProps & { display?: "block" | "inline" }
			mrow: MathMLProps
			msup: MathMLProps
			mfrac: MathMLProps
			msqrt: MathMLProps
			mtext: MathMLProps
			mspace: MathMLProps & { width?: string }
		}
	}
}
