# Coulomb's Law

**English** | [Português (Brasil)](README.pt-BR.md)

<div align="center">
	<h5>
		A website that calculates the force, charge or distance between two stationary electric charges
		<br>
		Every step of the calculation is shown, rendered as LaTeX
	</h5>
	<a href="https://coulomb-law.vercel.app">Live site</a>
</div>

<br>

<p align="center">
	<a href="https://github.com/Alphka/Coulombs-Law/actions/workflows/ci.yml">
		<img alt="Build" src="https://img.shields.io/github/actions/workflow/status/Alphka/Coulombs-Law/ci.yml?branch=main&style=for-the-badge&label=Build">
	</a>
	<a href="LICENSE.md">
		<img alt="License: ISC" src="https://img.shields.io/badge/License-ISC-5271FF?style=for-the-badge">
	</a>
	<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
	<img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white">
</p>

## About

The page has three calculators. Given Coulomb's constant and any two of the other three quantities, you can find the missing one:

- **Force** from the two charges and the distance between them.
- **Charge** (the first one) from the force, the second charge and the distance.
- **Distance** from the force and the two charges.

Each result is shown as a sequence of algebraic steps, so you can follow how the value was obtained.

<p align="center">
	<img alt="Screenshot of the distance calculator on desktop" src=".github/screenshot-desktop.png" width="640">
	<img alt="Screenshot of the charge calculator on mobile" src=".github/screenshot-mobile.png" width="220">
</p>

## Formula and units

The app implements Coulomb's law for two point charges:

$$F = k \cdot \frac{|q_1| \cdot |q_2|}{d^2}$$

| Symbol | Meaning | Unit |
|---|---|---|
| `F` | Electrostatic force | newton (N) |
| `k` | Coulomb's constant | N·m²/C² |
| `q₁`, `q₂` | Electric charges | coulomb (C) |
| `d` | Distance between the charges | meter (m) |

Rearranged by the app, as implemented in [`src/scripts/calculate.ts`](src/scripts/calculate.ts):

- Charge: `q₁ = F · d² / (k · |q₂|)`
- Distance: `d = √(k · |q₁| · |q₂| / F)`

> [!NOTE]
> Coulomb's constant is entered as a coefficient of 10⁹ N·m²/C² and must be between `8.9` and `9` (default `9`). The datalist suggests `8.998`, `8.99`, `8.9` and `9`.
>
> Charges are used as magnitudes (absolute values), so the force shown is the magnitude of the force, not its direction (attractive or repulsive). The force calculator requires a distance different from zero, the charge calculator also requires a second charge different from zero, and the distance calculator requires a force greater than zero.

## Features

- Three calculators: force, charge and distance, in an accessible tabs pattern (arrow keys, `Home` and `End` switch tabs).
- Step-by-step results rendered with [KaTeX](https://katex.org/), announced to screen readers.
- Input validation: only decimal numbers and scientific notation (for example `1.6e-19`) are accepted, and invalid fields are highlighted.
- Keyboard support: `Enter` moves to the next field and submits on the last one.
- Responsive layout, with no external requests: the fonts and libraries are bundled with the site.

> [!NOTE]
> The page needs JavaScript enabled.

## Tech stack

- [TypeScript](https://www.typescriptlang.org/) (compiled as ES modules for the browser)
- [Vite](https://vite.dev/) for the development server and the build (with source maps)
- [Sass](https://sass-lang.com/) for the styles
- [KaTeX](https://katex.org/) to render the steps (installed from npm and bundled)
- [Vitest](https://vitest.dev/) for the unit tests of the formulas
- [pnpm](https://pnpm.io/) as the package manager

## Requirements

- [Node.js](https://nodejs.org/) `22.12.0` or later (the minimum required by Vite 8). The CI workflow builds the project on the latest release of Node.js 22, 24 and 26.
- [pnpm](https://pnpm.io/) `11` or `12`. The exact version is pinned in the `packageManager` field of `package.json`, so it is selected automatically.

## Installation

```sh
git clone https://github.com/Alphka/Coulombs-Law.git
cd Coulombs-Law
pnpm install
```

## Usage

Start the development server (with hot reload):

```sh
pnpm dev
```

Build the site into the local `dist` folder and preview it:

```sh
pnpm build
pnpm preview
```

> [!NOTE]
> The built files use `type="module"` scripts, which browsers do not run from local files (`file://`). Use `pnpm dev` or `pnpm preview`, or any static server.

### Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Starts the Vite development server |
| `pnpm build` | Builds the page, scripts and styles into `dist`, with source maps |
| `pnpm preview` | Serves the `dist` folder locally |
| `pnpm typecheck` | Type-checks the sources and the Vite configuration without emitting files |
| `pnpm test` | Runs the unit tests |

## Browser support

The supported browsers are listed in the `browserslist` field of `package.json` (Chrome and Edge 111+, Firefox 114+, Safari and iOS 16.4+). They are also used to prefix and minify the CSS.

## Deployment

The site is static and is deployed on [Vercel](https://vercel.com/). The [`vercel.json`](vercel.json) file sets the Vite framework and the `dist` output directory, so the project settings in the dashboard do not need to be changed. Vercel installs the dependencies with pnpm because of `pnpm-lock.yaml`.

The file also sets long-lived cache headers for the hashed files in `/assets` and security headers, including a Content Security Policy that only allows the site itself (KaTeX sets some inline `style` attributes, so `style-src-attr` allows them). If the site starts to use an external service, add its origin to the matching directive in `vercel.json`.

## Project structure

```text
src/
├── public/          Files copied as they are to the root of the build (favicon and web manifest)
├── scripts/         TypeScript source: main.ts (interface), calculate.ts (formulas and steps),
│                    math.ts (number helpers) and calculate.test.ts (tests)
├── styles/          Sass stylesheet (main.scss also imports the KaTeX styles)
└── index.html       The page
.github/              CI workflow and the screenshots used in this README
vite.config.ts       Vite and Vitest configuration
tsconfig.json        TypeScript configuration (one project for the sources and the Vite config)
vercel.json          Vercel configuration
```

## Tests

`pnpm test` runs the unit tests of the formulas. Most expected values were generated by the implementation that existed before version 2.0.0, so the steps and results stay identical.

## License

[ISC](LICENSE.md) © 2022 Kayo Souza
