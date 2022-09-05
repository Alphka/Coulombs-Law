import type { MenuItem, MenuItems, NavItem, NavItems } from "../typings"
import Calculate from "./helpers/Calculate"

declare var math: typeof import("mathjs")
declare var MathJax: any

function Debug(...message: any[]){
	if(!message.length) return
	if(message.length === 1 && typeof message[0] === "string") message[0] = new Error(message[0])

	console.error(...message)
}

async function InsertScript(src: string, callback?: (script: HTMLScriptElement) => any){
	const script = document.createElement("script")

	script.src = src
	callback?.(script)

	try{
		await new Promise((resolve, reject) => {
			script.onload = resolve
			script.onerror = reject
			document.head.appendChild(script)
		})
	}finally{
		script.onload = null
		script.onerror = null
	}
}

function InsertAsyncScript(script: string, callback?: (script: HTMLScriptElement) => void){
	return InsertScript(script, script => {
		script.async = true
		callback?.(script)
	})
}

function InsertCDN(script: string, callback?: (script: HTMLScriptElement) => void){
	return InsertAsyncScript(script, script => {
		script.crossOrigin = "anonymous"
		script.referrerPolicy = "no-referrer"
		callback?.(script)
	})
}

const BodyPromise = document.readyState === "loading"
	? new Promise<void>(resolve => window.addEventListener("DOMContentLoaded", () => resolve()))
	: Promise.resolve()

const HeadPromise = document.head ? Promise.resolve() : new Promise<void>(resolve => {
	function listener(){
		if(document.head){
			document.removeEventListener("DOMSubtreeModified", listener)
			resolve()
		}
	}

	document.addEventListener("DOMSubtreeModified", listener)
})

let mathjsPromise: Promise<void>

HeadPromise.then(() => {
	mathjsPromise = InsertCDN("https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.0.1/math.js", script =>
		script.integrity = "sha512-qUD6aWQY0c9uVWnPVcbUzQg9Q06qfCpZhOK7jbWDKEAuX+i6gwS5P2VoDe+ZghmUepiB1FtBY5gNosseexrt9Q=="
	).catch(() => InsertAsyncScript("/scripts/math.js"))

	InsertCDN("https://polyfill.io/v3/polyfill.min.js?features=es6")
		.catch(() => console.error(new Error("Error loading polyfill")))
		.finally(() => InsertCDN("https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"))
		.catch(() => InsertAsyncScript("/scripts/mathjax.js"))
})

class Constant {
	label: HTMLLabelElement
	paragraphs: NodeListOf<HTMLParagraphElement>
	title: HTMLParagraphElement
	input: HTMLInputElement
	text: Array<ChildNode>

	constructor(container: HTMLElement){
		this.label = container.querySelector(":scope > label")!
		this.paragraphs = this.label.querySelectorAll(":scope > p")
		this.title = this.paragraphs[0]
		this.input = this.title.nextElementSibling!.querySelector(":scope > input")!

		this.text = new Array
		this.AddTextNodes()
		this.AddEventListener()
	}
	private AddTextNodes(){
		const parent = this.paragraphs[1]
		const children = Array.from(parent.childNodes)
		const inputIndex = children.indexOf(this.input)

		children.splice(0, inputIndex + 1)

		for(const child of children) this.text.push(child)
	}
	private AddEventListener(){
		let isFocused = false, timeout: number

		this.input.addEventListener("click", function(event){
			if(!isFocused) this.select()
		})

		this.input.addEventListener("focus", async () => timeout = window.setTimeout(() => isFocused = true, 70))
		this.input.addEventListener("blur", () => (isFocused = false, clearTimeout(timeout)))
	}
}

class Content {
	header: HTMLElement
	title: HTMLParagraphElement
	nav: {
		element: HTMLElement
		items: NavItems
		readonly active: string
	}
	menu: {
		element: HTMLMenuElement
		items: MenuItems
		readonly active: string
	}
	result: HTMLDivElement

	constructor(element: HTMLElement){
		this.header = element.querySelector(":scope > header")!
		this.title = this.header.querySelector(":scope > p")!

		const nav = element.querySelector<HTMLElement>(":scope > nav")!
		const section = element.querySelector<HTMLElement>(":scope > section")!
		const menu = section.querySelector<HTMLMenuElement>(":scope > menu")!
		const result = this.result = section.querySelector<HTMLDivElement>(":scope > div#result")!

		result.removeAttribute("id")
		result.ariaLabel = "Result"

		this.nav = {
			element: nav,
			items: [] as unknown as NavItems,
			get active(){
				const active = this.items.find(({ element }) => element.hasAttribute("active"))
				return (active ?? this.items[0]).id
			}
		}

		this.menu = {
			element: menu,
			items: [] as unknown as MenuItems,
			get active(){
				const active = this.items.find(({ element }) => element.hasAttribute("active"))
				return (active ?? this.items[0]).id
			}
		}

		this.SetNavItems()
		this.SetMenuItems()

		section.querySelector("noscript")?.remove()
	}
	public SetNavItems(){
		const nav = this.nav.element
		const ol = nav.querySelector(":scope > ol")!
		const items = ol.querySelectorAll("li")
		const map = new Map<string, NavItem>

		for(const element of items){
			const id = element.dataset.id!
			const navItem: NavItem = {
				element,
				id,
				get text(){
					return this.element.innerText
				}
			}

			this.nav.items.push(navItem)
			map.set(id, navItem)
		}

		Object.defineProperty(this.nav.items, "get", {
			configurable: false,
			enumerable: false,
			writable: false,
			value: (id: string) => map.has(id) ? map.get(id)! : null
		})
	}
	public SetMenuItems(){
		const { menu } = this
		const { items } = menu

		const map = new Map<MenuItem["id"], MenuItem>

		for(const element of menu.element.querySelectorAll("li")){
			const id = element.id as MenuItem["id"]
			const item: MenuItem = {
				element,
				id,
				labels: [],
				submit: element.querySelector(":scope > input[type=submit]") as HTMLInputElement
			}

			for(const label of element.querySelectorAll("label")){
				const paragraphs = label.querySelectorAll<HTMLParagraphElement>(":scope > p")

				item.labels.push({
					element: label,
					title: paragraphs[0],
					input: paragraphs[1].querySelector(":scope > input") as HTMLInputElement
				})
			}

			items.push(item)
			map.set(id, item)
		}

		Object.defineProperty(items, "get", {
			configurable: false,
			enumerable: false,
			writable: false,
			value: (id: MenuItem["id"]) => map.has(id) ? map.get(id)! : null
		})
	}

	// TODO: Remember the last active element using localStorage
	public SetActive(id?: string){
		const { nav } = this
		const { items, active } = nav

		if(!id) id = active
		else if(id === active) return
		else if(!items.find(item => item.id === id)) throw new Error("Item doesn't exist")

		for(const item of this.menu.items){
			const { element, id: elementId } = item
			const navItem = nav.items.get(element.id)!.element

			if(elementId === id){
				navItem.setAttribute("active", "")

				if(element.hasAttribute("active")) continue

				element.setAttribute("active", "")
				this.ClearInputs(elementId)
			}else{
				navItem.removeAttribute("active")
				element.removeAttribute("active")
			}
		}

		this.ClearResult()
	}
	public ClearResult(){
		this.result.innerHTML = ""
	}
	public ClearInputs(id: MenuItem["id"]): void
	public ClearInputs(id: string): void
	public ClearInputs(all: boolean): void
	public ClearInputs(attribute: string | boolean){
		const { menu: { items } } = this

		function ClearItemInputs({ labels }: MenuItem){
			for(const { input } of labels){
				input.value = ""
				input.classList.remove("error")
			}
		}

		if(typeof attribute === "boolean"){
			if(attribute === true){
				for(const item of items) ClearItemInputs(item)
			}

			return
		}

		ClearItemInputs(items.get(attribute)!)
	}
	public SetListeners(){
		const { nav, menu } = this

		let lastId: string

		for(const { element, id } of nav.items){
			element.addEventListener("touchstart", event => (
				event.preventDefault(),
				this.SetActive(id)
			))
			element.addEventListener("click", () => this.SetActive(id))
		}

		for(const { labels, submit } of menu.items){
			const { length } = labels

			labels.forEach(({ input }, index) => {
				input.addEventListener("keypress", ({ key }) => {
					if(key === "Enter"){
						if(index === length - 1) submit.click()
						else labels.at(index + 1)!.input.focus()
					}
				})

				input.addEventListener("input", function(){
					if(this.classList.contains("error")) this.classList.remove("error")
				})
			})
		}
	}
	public SetMathListeners(constant: Constant){
		const HandleResult = this.HandleResult.bind(this) as typeof this.HandleResult
		const { menu: { items } } = this

		const force = items.get("force")!
		const charge = items.get("charge")!
		const distance = items.get("distance")!

		force.submit.addEventListener("click", event => this.OnSubmit(force, event, function(){
			const inputs = this.labels.map(({ input }) => input)

			const { value: charge1 } = inputs[0]
			const { value: charge2 } = inputs[1]
			const { value: distance } = inputs[2]

			try{
				const calculate = new Calculate
				calculate.Force(constant.input.value, charge1, charge2, distance)
				HandleResult(calculate)
			}catch(error: any){
				throw error
			}
		}))

		charge.submit.addEventListener("click", event => this.OnSubmit(charge, event, function(){
			const inputs = this.labels.map(({ input }) => input)

			const { value: force } = inputs[0]
			const { value: charge2 } = inputs[1]
			const { value: distance } = inputs[2]

			try{
				const calculate = new Calculate
				calculate.Charge(constant.input.value, force, charge2, distance)
				HandleResult(calculate)
			}catch(error: any){
				throw error
			}
		}))

		distance.submit.addEventListener("click", event => this.OnSubmit(distance, event, function(){
			const inputs = this.labels.map(({ input }) => input)

			const { value: force } = inputs[0]
			const { value: charge1 } = inputs[1]
			const { value: charge2 } = inputs[2]

			try{
				const calculate = new Calculate
				calculate.Distance(constant.input.value, force, charge1, charge2)
				HandleResult(calculate)
			}catch(error: any){
				throw error
			}
		}))
	}
	/** Check data, then call callback */
	private OnSubmit(item: MenuItem, event: MouseEvent, callback?: (this: MenuItem) => void){
		const { labels, id } = item

		event.preventDefault()

		let errorSet = false, error = {} as {
			error: string
			message: string
		}

		try{
			labels.forEach(({ input }, index) => {
				const value = input.value = input.value.trim()
				const inputLocation = `#${id}.label[${index}].input`
				const setError = (e: typeof error) => {
					input.classList.add("error")

					if(!errorSet){
						errorSet = true
						error = e
					}
				}

				if(!value) setError({
					error: `Empty input at ${inputLocation}`,
					message: "Missing information"
				})

				if(!(/^[-+]?\d+(\.\d+)?(e[-+]?\d+)?$/.test(value) || /^\.\d+$/.test(value))){
					if(!errorSet){
						if(event.isTrusted) input.focus()
						setError({
							error: `Invalid expression at ${inputLocation}`,
							message: "Invalid expression"
						})
					}
				}
			})

			if(errorSet) throw error

			callback?.call(item)

			if(!event.isTrusted) labels[0].input.focus()
		}catch(_error: any){
			if(typeof _error === "string") this.HandleError(_error)
			else if(errorSet) this.HandleError(error.message), Debug(error.error)
			else console.error(_error)
		}
	}
	private HandleError(error: string){
		const { result } = this
		const paragraph = document.createElement("p")

		result.innerHTML = ""
		paragraph.innerText = error
		result.classList.add("error")
		result.appendChild(paragraph)
	}
	private HandleResult(calculate: Calculate){
		const { result: resultElement } = this
		const { steps } = calculate

		resultElement.innerHTML = ""

		if(resultElement.classList.contains("error")) resultElement.classList.remove("error")

		for(const step of steps){
			const paragraph = document.createElement("p")

			paragraph.innerHTML = "$\\sf " + step + "$"
			resultElement.appendChild(paragraph)
		}

		MathJax.typeset(resultElement.childNodes)
	}
}

BodyPromise.then(async () => {
	const main = document.querySelector("main")!
	const constant = new Constant(main.querySelector("#constant")!)
	const content = new Content(main.querySelector("#content")!)

	content.SetActive()
	content.SetListeners()

	mathjsPromise.then(() => content.SetMathListeners(constant))
})
