# Coulomb's Law

A website that calculates the amount of force between two stationary and electrically charged particles using Coulomb's Law, showing every step of the calculation rendered as LaTeX.

**Live site:** <https://coulomb-law.vercel.app>

<p align="center">
	<img alt="License" src="https://img.shields.io/badge/License-ISC-5271FF?style=for-the-badge">
	<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
	<img alt="Webpack" src="https://img.shields.io/badge/Webpack-5-8DD6F9?style=for-the-badge&logo=webpack&logoColor=black">
</p>

## Table of Contents
- [About](#about)
- [Formula and Units](#formula-and-units)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [License](#license)

## About
The page has three calculators. Given Coulomb's constant and any two of the other three quantities, you can find the missing one:

- **Force** from the two charges and the distance between them.
- **Charge** (the first one) from the force, the second charge and the distance.
- **Distance** from the force and the two charges.

Each result is shown as a sequence of algebraic steps, so you can follow how the value was obtained.

## Formula and Units
The app implements Coulomb's Law for two point charges:

$$F = k \cdot \frac{|q_1| \cdot |q_2|}{d^2}$$

| Symbol | Meaning | Unit |
|---|---|---|
| `F` | Electrostatic force | newton (N) |
| `k` | Coulomb's constant | N·m²/C² |
| `q₁`, `q₂` | Electric charges | coulomb (C) |
| `d` | Distance between the charges | meter (m) |

Rearranged by the app, as implemented in [`src/scripts/helpers/Calculate.ts`](src/scripts/helpers/Calculate.ts):

- Charge: `q₁ = F · d² / (k · |q₂|)`
- Distance: `d = √(k · |q₁| · |q₂| / F)`

> [!NOTE]
> Coulomb's constant is entered as a coefficient of 10⁹ N·m²/C² and must be between `8.9` and `9` (default `9`). The datalist suggests `8.998`, `8.99`, `8.9` and `9`.
>
> Charges are used as magnitudes (absolute values), so the force shown is the magnitude of the force, not its direction (attractive or repulsive). The distance calculator requires a force greater than zero, and the force calculator requires a distance different from zero.

## Features
- Three calculators: force, charge and distance.
- Step-by-step results rendered with [MathJax](https://www.mathjax.org/).
- Input validation: only decimal numbers and scientific notation (for example `1.6e-19`) are accepted, and invalid fields are highlighted.
- Keyboard support: `Enter` moves to the next field and submits on the last one.
- CDN fallbacks: local copies of MathJax and math.js in `public/scripts` are used if the CDN fails to load.

> [!NOTE]
> The page needs JavaScript enabled.

## Tech Stack
- **TypeScript**, bundled with **webpack 5** (`ts-loader` and `babel-loader`)
- **Pug** and **Sass**, compiled with **Gulp 4**
- **MathJax 3** (LaTeX rendering) and **math.js**, loaded from a CDN with local fallbacks
- **Express** to serve the production build (`heroku.js`, used by the `Procfile`)
- **BrowserSync** for the development server

## Requirements
- Node.js 16 or newer
- npm 8 or newer

## Installation
```bash
git clone https://github.com/Alphka/Coulombs-Law.git
cd Coulombs-Law
npm ci
```

## Usage
Production build (output in `build/`) and static server:

```bash
npm run build
node heroku.js
```

The server listens on the `PORT` environment variable, or on port `3000` if it is not set.

Development mode (output in `dist/`, with BrowserSync at <http://localhost:3000>):

```bash
npm run watch:dev
```

## Scripts
| Script | Description |
|---|---|
| `npm run build` | Build HTML, CSS and JS into `build/` |
| `npm run dev` | Build in development mode into `dist/` |
| `npm run watch` | Rebuild on changes (production mode) |
| `npm run watch:dev` | Rebuild on changes (development mode) with BrowserSync |
| `npm run webpack`, `npm run gulp` | Run only the scripts (webpack) or the pages and styles (Gulp) part of the build |

> [!NOTE]
> The project has no automated tests or lint script. Type errors are reported by `ts-loader` during the webpack build.

## Project Structure
```
src/
  index.pug               Page template
  styles/main.scss        Styles
  scripts/index.ts        UI logic and script loading
  scripts/helpers/        Calculate.ts (formulas and steps), Math.ts (number helpers)
public/scripts/           Local fallbacks for math.js and MathJax
gulp/                     Gulp tasks (clear, copy, pug, sass)
webpack.config.ts         Webpack configuration
heroku.js, Procfile       Static server for the build folder
```

## License
[ISC](LICENSE.md) © 2022 Kayo Souza
