import ptBR from "./pt-BR.json"
import en from "./en.json"

type MessageTree = { [key: string]: string | MessageTree }

function flatten(messages: MessageTree, prefix = ""): Record<string, string>{
	return Object.fromEntries(Object.entries(messages).flatMap(([key, value]) => {
		const path = prefix ? `${prefix}.${key}` : key

		return typeof value === "string" ? [[path, value]] : Object.entries(flatten(value, path))
	}))
}

function byName(a: string, b: string){
	return a.localeCompare(b)
}

function getArguments(message: string){
	return [...message.matchAll(/\{(?<name>\w+)/gv)].map((match) => match[1]).toSorted(byName)
}

describe("messages", () => {
	const english = flatten(en)
	const portuguese = flatten(ptBR)

	it("has the same keys in every locale", () => {
		expect(Object.keys(portuguese).toSorted(byName)).toEqual(Object.keys(english).toSorted(byName))
	})

	it.each(Object.keys(english))("uses the same arguments in %s", (key) => {
		expect(getArguments(portuguese[key])).toEqual(getArguments(english[key]))
	})
})
