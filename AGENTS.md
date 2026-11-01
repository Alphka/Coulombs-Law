# Coulomb's Law

A single-page Next.js (App Router) site, deployed on Vercel, with three calculators for **Coulomb's law**: given Coulomb's constant and two of the other three quantities (force, charge, distance) it finds the missing one and shows every step. The UI is translated into English (default) and Brazilian Portuguese.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Commands

Package manager is **pnpm** (`packageManager` pins 12.x; `engines` requires Node `>=22.22.2`).

```bash
pnpm dev        # next dev
pnpm build      # next build
pnpm lint       # eslint (cached) + cspell over the whole repo
pnpm lint:fix   # eslint --fix only (does NOT run cspell)
pnpm tsc        # next typegen && tsc — type-check (noEmit); also regenerates messages/*.d.json.ts
pnpm test       # jest (next/jest, jsdom)
pnpm test src/app/helpers/calculate.test.ts   # a single file
pnpm test -t "is exact"                        # a single test by name
```

CI (`.github/workflows/ci.yml`) runs tsc, lint, test and build on pushes to `main` and on pull requests.

`pnpm install` of the `github:Alphka/eslint-plugin-ordering-conventions` dependency uses git over HTTPS. If it fails with an SSL error on the maintainer's machine, run it with `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=http.sslbackend GIT_CONFIG_VALUE_0=schannel`; do not change the git configuration.

## Architecture

- **Routing and i18n (next-intl):** `src/app/[locale]/layout.tsx` is the root layout (it renders `<html lang>`). Locales are `en` (default) and `pt-BR`, configured in `src/i18n/routing.ts` with `localePrefix: "always"` and `localeDetection: true` plus a `localeCookie` (`NEXT_LOCALE`, 30 days), so `/` uses the visitor's previously chosen locale (the cookie), falling back to `Accept-Language`, then to the default. `src/proxy.ts` (Next 16's replacement for `middleware.ts`) applies the routing; `src/i18n/request.ts` reads the locale from `next/root-params`. `[locale]/[...rest]/page.tsx` and `[locale]/not-found.tsx` render every 404 inside the layout, translated.
- **Cache Components** (`cacheComponents` + `partialPrefetching`) are on: both locale pages are prerendered at build time via `generateStaticParams`. Read `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.md` before adding data fetching or route segment configs.
- **Messages** live in `messages/{en,pt-BR}.json`. The next-intl plugin (`next.config.ts`) generates `messages/*.d.json.ts` and precompiles the messages. `en.json` is the source of the `AppConfig` types (`src/typings/next-intl.d.ts`), so keys and ICU arguments are type-checked. Numeric arguments use `{name, number}`. `messages/messages.test.ts` fails if the locales drift apart in keys or arguments.
- **Calculator** (`src/app/components/Calculator.tsx`, the `"use client"` entry) owns all the state with `useState` (active tab, constant, invalid field, result); there is no Context or store because nothing is shared beyond a few props. `Tabs` is an automatic-activation tabs pattern (arrow keys, Home, End), `CalculatorForm` renders the fields of the active calculator (Enter moves to the next field and submits on the last), `NumberField` and `ConstantField` are the inputs, `Result` is the live region and `MathView` renders the steps.
- **Calculations** (`src/app/helpers/calculate.ts`) are pure. The fields of each calculator are in `CALCULATORS` (`src/app/constants.ts`). `parseNumber.ts` turns the text into an exact `Fraction` (fraction.js, `BigInt` rationals; it accepts scientific notation and a decimal comma, and rejects exponents beyond ±1000). Charges are used as magnitudes. Invalid input throws `CalculationError` (`src/app/entities/`) with a message key from `errors` and the offending field, which the UI marks and focuses.
- **Steps** are a typed tree of MathML nodes (`src/app/helpers/math.ts`: `mn`, `mi`, `mo`, `frac`, `power`, `sqrt`, ...) rendered by `MathView` as native MathML; no math library is needed. Numbers have 12 significant digits and use plain decimals for exponents from -3 to 3. `src/testing/toLatex.ts` turns a step back into LaTeX for the tests.
- **Security headers** (CSP, Permissions-Policy, ...) are set in `next.config.ts`. The CSP allows inline scripts and styles because Next.js needs them; add an origin there if the site ever uses an external service.

### Path aliases (tsconfig)

`@app/*` → `src/app/*`, `@components/*`, `@entities/*`, `@helpers/*`, `@i18n/*` → `src/i18n/*`, `@testing/*` → `src/testing/*`. next/jest resolves them while compiling, but `jest.mock()` paths are not rewritten, so mock with relative paths.

### tsconfig.json

`next dev`, `next build` and `next typegen` can rewrite `tsconfig.json` with 2-space indentation. The content is the same, but the file must follow `.editorconfig` (tabs, LF): check `git diff tsconfig.json` before committing and restore the committed formatting.

### Testing

Jest via `next/jest` (`jest.config.ts`). next-intl is ESM-only, so `transformIgnorePatterns` lets it and its `@formatjs` dependencies be transformed. Render components that use translations with `@testing/renderWithIntl` (English messages). The expected steps in `calculate.test.ts` were generated by the pre-3.0.0 implementation, apart from the intended fixes listed in the header comment of that file.

### Styling

Tailwind CSS **v4**, configured CSS-first (no `tailwind.config`): `globals.css` imports `tailwindcss`, defines the palette in `@theme` and keeps only the base rules (focus ring, hidden number spinners, MathML size) in `@layer base`. Everything else uses utility classes. The UI is dark-only.

## Code conventions (enforced by ESLint — `eslint.config.ts`)

- Tabs, LF, double quotes, **no semicolons**.
- No space between control keywords and parens, and none before function parens: `if(x){`, `}else{`, `for(...)`, `function Foo(){`, `}catch(error){`.
- Interfaces must be PascalCase prefixed with `I` (`ITabsProps`); interface members, destructured parameters and imports are ordered by `ordering-conventions` (by length). Run `pnpm lint:fix` rather than hand-sorting.
- Type-only imports use `import type`; Tailwind classes are also linted (`eslint-plugin-better-tailwindcss`).
- `unicorn/no-top-level-side-effects` only reports mutations of globals since unicorn v79; it is enabled explicitly in the config.
- cspell checks English **and** pt-BR; add legitimate unknown words to `.cspell.json` → `words`.
