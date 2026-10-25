import katex from "katex"
import { CalculationError, calculateCharge, calculateDistance, calculateForce, isValidNumber, type Calculation } from "./calculate"

const calculators: Record<string, (constant: string, ...values: [string, string, string]) => Calculation> = {
	force: calculateForce,
	charge: calculateCharge,
	distance: calculateDistance
}

function query<T extends Element>(selector: string, parent: ParentNode = document){
	const element = parent.querySelector<T>(selector)

	if(!element) throw new Error(`Element not found: ${selector}`)

	return element
}

function renderTex(element: HTMLElement, tex: string){
	katex.render(tex, element, { throwOnError: false })
}

const tool = query<HTMLElement>(".tool")
const constantInput = query<HTMLInputElement>("#constant")
const tabList = query<HTMLElement>("[role=tablist]")
const result = query<HTMLElement>("#result")
const tabs = Array.from(tabList.querySelectorAll<HTMLButtonElement>("[role=tab]"))
const forms = Array.from(tool.querySelectorAll<HTMLFormElement>("form"))

for(const element of tool.querySelectorAll<HTMLElement>("[data-tex]")) renderTex(element, element.dataset.tex!)

// Selects the constant on the first click, so the next click can place the cursor
let constantWasFocused = false

constantInput.addEventListener("pointerdown", () => constantWasFocused = document.activeElement === constantInput)
constantInput.addEventListener("click", () => {
	if(!constantWasFocused) constantInput.select()
})

function getInputs(form: HTMLFormElement){
	return Array.from(form.querySelectorAll<HTMLInputElement>("input"))
}

function clearInputs(form: HTMLFormElement){
	for(const input of getInputs(form)){
		input.value = ""
		input.removeAttribute("aria-invalid")
	}
}

function clearResult(){
	result.replaceChildren()
	result.classList.remove("error")
}

function selectTab(tab: HTMLButtonElement, focus = false){
	const active = tabs.find(tab => tab.getAttribute("aria-selected") === "true")

	if(tab !== active){
		for(const item of tabs){
			const selected = item === tab
			const form = document.getElementById(item.getAttribute("aria-controls")!) as HTMLFormElement

			item.setAttribute("aria-selected", String(selected))
			item.tabIndex = selected ? 0 : -1
			form.hidden = !selected

			if(selected) clearInputs(form)
		}

		clearResult()
	}

	if(focus) tab.focus()
}

tabList.addEventListener("click", ({ target }) => {
	const tab = (target as Element).closest<HTMLButtonElement>("[role=tab]")
	if(tab) selectTab(tab)
})

tabList.addEventListener("keydown", event => {
	const index = tabs.findIndex(tab => tab === document.activeElement)
	if(index === -1) return

	const last = tabs.length - 1
	const next = {
		ArrowRight: index === last ? 0 : index + 1,
		ArrowLeft: index === 0 ? last : index - 1,
		Home: 0,
		End: last
	}[event.key]

	if(next === undefined) return

	event.preventDefault()
	selectTab(tabs[next]!, true)
})

function showError(message: string){
	const paragraph = document.createElement("p")

	paragraph.textContent = message
	result.replaceChildren(paragraph)
	result.classList.add("error")
}

function showResult({ steps }: Calculation){
	result.classList.remove("error")
	result.replaceChildren(...steps.map(step => {
		const paragraph = document.createElement("p")

		renderTex(paragraph, "\\mathsf{" + step + "}")

		return paragraph
	}))
}

/** Checks the inputs, marking the invalid ones. Returns the message for the first error */
function validate(inputs: HTMLInputElement[]){
	let message: string | undefined
	let firstInvalid: HTMLInputElement | undefined

	for(const input of inputs){
		const value = input.value = input.value.trim()
		const error = !value ? "Missing information" : !isValidNumber(value) ? "Invalid expression" : undefined

		if(!error){
			input.removeAttribute("aria-invalid")
			continue
		}

		input.setAttribute("aria-invalid", "true")
		message ??= error
		firstInvalid ??= input
	}

	firstInvalid?.focus()

	return message
}

tool.addEventListener("submit", event => {
	event.preventDefault()

	const form = event.target as HTMLFormElement
	const inputs = getInputs(form)
	const error = validate(inputs)

	if(error) return showError(error)

	try{
		const [first, second, third] = inputs.map(input => input.value) as [string, string, string]
		showResult(calculators[form.id]!(constantInput.value, first, second, third))
	}catch(error){
		if(error instanceof CalculationError) return showError(error.message)

		console.error(error)
		showError("Something went wrong")
	}
})

// Enter moves to the next field; on the last field the browser submits the form
tool.addEventListener("keydown", event => {
	const input = event.target
	if(event.key !== "Enter" || !(input instanceof HTMLInputElement) || !input.form || input.id === "constant") return

	const inputs = getInputs(input.form)
	const next = inputs[inputs.indexOf(input) + 1]

	if(!next) return

	event.preventDefault()
	next.focus()
})

tool.addEventListener("input", ({ target }) => {
	if(target instanceof HTMLInputElement) target.removeAttribute("aria-invalid")
})

tool.hidden = false
