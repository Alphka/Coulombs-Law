export interface NavItem {
	element: HTMLLIElement
	id: string
	text: string
}

export type NavItems = NavItem[] & {
	get: (id: string) => NavItem | null
}

export interface MenuItem {
	element: HTMLLIElement
	id: "force" | "charge" | "distance"
	labels: {
		element: HTMLLabelElement
		title: HTMLParagraphElement
		input: HTMLInputElement
	}[]
	submit: HTMLInputElement
}

declare function MenuItemsGet(id: MenuItem["id"]): MenuItem | null
declare function MenuItemsGet(id: string): MenuItem | null

export type MenuItems = MenuItem[] & {
	get: typeof MenuItemsGet
}
