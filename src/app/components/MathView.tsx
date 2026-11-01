"use client"

import type { MathNode, MathRow } from "@helpers/math"
import { useLocale } from "next-intl"
import { useMemo } from "react"

function getDecimalSeparator(locale: string){
	return new Intl.NumberFormat(locale).formatToParts(1.1).find((part) => part.type === "decimal")?.value ?? "."
}

interface IMathViewProps {
	/** A row of MathML nodes. Numbers use "." and are shown with the decimal separator of the locale */
	display?: "block" | "inline"
	row: MathRow
}

export default function MathView({ row, display = "block" }: IMathViewProps){
	const locale = useLocale()
	const decimalSeparator = useMemo(() => getDecimalSeparator(locale), [locale])

	function renderRow(nodes: MathRow){
		return nodes.map((node, index) => renderNode(node, index))
	}

	function renderNode(node: MathNode, key: number){
		switch(node.type){
			case "mn": return <mn key={key}>{node.text.replace(".", decimalSeparator)}</mn>
			case "mi": return <mi key={key}>{node.text}</mi>
			case "mo": return <mo key={key}>{node.text}</mo>
			case "mtext": return <mtext key={key}>{node.text}</mtext>
			case "mfrac": return (
				<mfrac key={key}>
					<mrow>{renderRow(node.numerator)}</mrow>
					<mrow>{renderRow(node.denominator)}</mrow>
				</mfrac>
			)
			case "msup": return (
				<msup key={key}>
					<mrow>{renderRow(node.base)}</mrow>
					<mrow>{renderRow(node.exponent)}</mrow>
				</msup>
			)
			case "mspace": return <mspace key={key} width="0.3em" />
			case "msqrt": return <msqrt key={key}>{renderRow(node.radicand)}</msqrt>
		}
	}

	return <math display={display}>{renderRow(row)}</math>
}
