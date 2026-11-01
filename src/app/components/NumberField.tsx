import type { ComponentProps, ReactNode } from "react"

interface INumberFieldProps extends Omit<ComponentProps<"input">, "id" | "type"> {
	invalid?: boolean
	label: string
	name: string
	unit?: ReactNode
}

/** A labeled input that accepts numbers, including scientific notation, so it is a text input */
export default function NumberField({
	invalid,
	label,
	name,
	unit,
	...props
}: INumberFieldProps){
	return (
		<label className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-center sm:gap-3">
			<span className="sm:w-56">
				{label}

				{unit && <span className="text-muted"> ({unit})</span>}
			</span>

			<input
				{...props}
				id={name}
				name={name}
				type="text"
				autoComplete="off"
				autoCapitalize="off"
				spellCheck={false}
				aria-invalid={invalid || undefined}
				className="h-8 w-full rounded-sm border border-outline bg-raised px-2 aria-invalid:border-danger sm:w-40"
			/>
		</label>
	)
}
