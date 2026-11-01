import type { Messages } from "next-intl"
import { NextIntlClientProvider } from "next-intl"
import { render, screen } from "@testing-library/react"
import renderWithIntl from "@testing/renderWithIntl"
import messagesPtBr from "../../../messages/pt-BR.json"
import Calculator from "./Calculator"
import userEvent from "@testing-library/user-event"

function setup(){
	const user = userEvent.setup()

	renderWithIntl(<Calculator />)

	return {
		user,
		field: (name: string) => screen.getByRole("textbox", { name: new RegExp(`^${name}`) }),
		result: () => screen.getByRole("status", { name: "Result" }),
		submit: () => user.click(screen.getByRole("button", { name: "Submit" }))
	}
}

describe("Calculator", () => {
	it("calculates the force and shows every step", async () => {
		const { user, field, result, submit } = setup()

		await user.type(field("First charge"), "1")
		await user.type(field("Second charge"), "2")
		await user.type(field("Distance"), "3.5")
		await submit()

		expect(result().querySelectorAll("math")).toHaveLength(4)
		expect(result().querySelectorAll("math")[3]).toHaveTextContent("1.4693877551")
		expect(field("First charge")).not.toBeInvalid()
	})

	it("moves to the next field with Enter and submits on the last one", async () => {
		const { user, field, result } = setup()

		await user.type(field("First charge"), "1{Enter}")
		expect(field("Second charge")).toHaveFocus()

		await user.type(field("Second charge"), "2{Enter}")
		expect(field("Distance")).toHaveFocus()

		await user.type(field("Distance"), "2{Enter}")
		expect(result().querySelectorAll("math")).toHaveLength(4)
	})

	it("reports an invalid field, marks it and focuses it", async () => {
		const { user, field, result, submit } = setup()

		await user.type(field("First charge"), "abc")
		await user.type(field("Second charge"), "2")
		await user.type(field("Distance"), "3")
		await submit()

		expect(result()).toHaveTextContent("\"First charge\" must be a number, such as 3, 0.5 or 1.6e-19.")
		expect(field("First charge")).toBeInvalid()
		expect(field("First charge")).toHaveFocus()

		await user.type(field("First charge"), "1")

		expect(field("First charge")).not.toBeInvalid()
	})

	it("reports a missing field", async () => {
		const { user, field, result, submit } = setup()

		await user.type(field("First charge"), "1")
		await submit()

		expect(result()).toHaveTextContent("Enter a value for the field \"Second charge\".")
		expect(field("Second charge")).toHaveFocus()
	})

	it("validates Coulomb's constant", async () => {
		const { user, field, result, submit } = setup()
		const constant = screen.getByRole("spinbutton", { name: "Coulomb's constant" })

		await user.type(field("First charge"), "1")
		await user.type(field("Second charge"), "1")
		await user.type(field("Distance"), "1")
		await user.clear(constant)
		await user.type(constant, "9.5")
		await submit()

		expect(result()).toHaveTextContent("Coulomb's constant must be between 8.9 and 9.")
		expect(constant).toBeInvalid()
	})

	it("switches the calculator with the mouse and the keyboard, clearing the fields and the result", async () => {
		const { user, field, result, submit } = setup()
		const tabs = () => screen.getAllByRole("tab").map((tab) => tab.getAttribute("aria-selected"))

		await user.type(field("First charge"), "1")
		await user.type(field("Second charge"), "2")
		await user.type(field("Distance"), "3")
		await submit()

		expect(result().childElementCount).toBe(4)

		await user.click(screen.getByRole("tab", { name: "Charge" }))

		expect(tabs()).toEqual(["false", "true", "false"])
		expect(field("Force")).toHaveValue("")
		expect(result()).toBeEmptyDOMElement()
		expect(screen.getByRole("tabpanel")).toHaveAccessibleName("Charge")

		await user.keyboard("{ArrowRight}")
		expect(screen.getByRole("tab", { name: "Distance" })).toHaveFocus()
		expect(tabs()).toEqual(["false", "false", "true"])

		await user.keyboard("{ArrowRight}")
		expect(tabs()).toEqual(["true", "false", "false"])

		await user.keyboard("{End}")
		expect(tabs()).toEqual(["false", "false", "true"])

		await user.keyboard("{Home}")
		expect(tabs()).toEqual(["true", "false", "false"])
	})

	it("explains the rules that depend on the calculator", async () => {
		const { user, field, result, submit } = setup()

		await user.click(screen.getByRole("tab", { name: "Charge" }))
		await user.type(field("Force"), "1")
		await user.type(field("Second charge"), "0")
		await user.type(field("Distance"), "2")
		await submit()

		expect(result()).toHaveTextContent("The second charge cannot be zero.")
	})

	it("is translated and uses the decimal separator of the locale", async () => {
		const user = userEvent.setup()

		render(
			<NextIntlClientProvider locale="pt-BR" messages={messagesPtBr as unknown as Messages}>
				<Calculator />
			</NextIntlClientProvider>
		)

		await user.type(screen.getByRole("textbox", { name: /^Primeira carga/ }), "0,5")
		await user.type(screen.getByRole("textbox", { name: /^Segunda carga/ }), "2")
		await user.type(screen.getByRole("textbox", { name: /^Distância/ }), "2")
		await user.click(screen.getByRole("button", { name: "Calcular" }))

		expect(screen.getByRole("status", { name: "Resultado" })).toHaveTextContent("2,25")
		expect(screen.getByRole("tab", { name: "Força" })).toHaveAttribute("aria-selected", "true")
	})
})
