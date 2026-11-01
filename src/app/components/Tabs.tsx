"use client"

import type { KeyboardEvent } from "react"
import getTabId from "@helpers/getTabId"

export interface ITabItem<Id extends string> {
	id: Id
	label: string
}

interface ITabsProps<Id extends string> {
	activeId: Id
	onChange: (id: Id) => void
	/** The id of the single panel controlled by the tabs */
	panelId: string
	items: readonly ITabItem<Id>[]
	label: string
}

/** An automatic-activation tabs pattern: the arrow keys, Home and End move between the tabs */
export default function Tabs<Id extends string>({
	activeId,
	onChange,
	panelId,
	label,
	items
}: ITabsProps<Id>){
	function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>){
		const index = items.findIndex(({ id }) => id === activeId)
		const last = items.length - 1

		const next = {
			ArrowRight: index === last ? 0 : index + 1,
			ArrowLeft: index === 0 ? last : index - 1,
			Home: 0,
			End: last
		}[event.key]

		if(next === undefined) return

		event.preventDefault()

		const { id } = items[next]

		onChange(id)
		document.getElementById(getTabId(id))?.focus()
	}

	return (
		<div
			role="tablist"
			aria-label={label}
			className="flex gap-0.5"
		>
			{items.map(({ id, label }) => (
				<button
					type="button"
					role="tab"
					id={getTabId(id)}
					aria-selected={id === activeId}
					aria-controls={panelId}
					tabIndex={id === activeId ? 0 : -1}
					className="flex-1 border border-outline bg-raised px-3 py-1.5 select-none first:rounded-l-lg last:rounded-r-lg hover:bg-surface active:shadow-[inset_0_0_5px_black] aria-selected:border-accent aria-selected:bg-accent aria-selected:font-semibold aria-selected:text-on-accent"
					onClick={() => onChange(id)}
					onKeyDown={handleKeyDown}
					key={id}
				>
					{label}
				</button>
			))}
		</div>
	)
}
