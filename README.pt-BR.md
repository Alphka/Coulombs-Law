# Coulomb's Law

[English](README.md) | **Português (Brasil)**

<div align="center">
	<h5>
		Um site que calcula a força, a carga ou a distância entre duas cargas elétricas em repouso
		<br>
		Cada passo do cálculo é mostrado, renderizado em LaTeX
	</h5>
	<a href="https://coulomb-law.vercel.app">Site publicado</a>
</div>

<br>

<p align="center">
	<a href="https://github.com/Alphka/Coulombs-Law/actions/workflows/ci.yml">
		<img alt="Build" src="https://img.shields.io/github/actions/workflow/status/Alphka/Coulombs-Law/ci.yml?branch=main&style=for-the-badge&label=Build">
	</a>
	<a href="LICENSE.md">
		<img alt="Licença: ISC" src="https://img.shields.io/badge/Licen%C3%A7a-ISC-5271FF?style=for-the-badge">
	</a>
	<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
	<img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white">
</p>

## Sobre

A página tem três calculadoras. Com a constante de Coulomb e duas das outras três grandezas, você encontra a que falta:

- **Força**, a partir das duas cargas e da distância entre elas.
- **Carga** (a primeira), a partir da força, da segunda carga e da distância.
- **Distância**, a partir da força e das duas cargas.

Cada resultado aparece como uma sequência de passos algébricos, para você acompanhar como o valor foi obtido. A interface do site está em inglês.

<p align="center">
	<img alt="Captura de tela da calculadora de distância no desktop" src=".github/screenshot-desktop.png" width="640">
	<img alt="Captura de tela da calculadora de carga no celular" src=".github/screenshot-mobile.png" width="220">
</p>

## Fórmula e unidades

O app implementa a lei de Coulomb para duas cargas pontuais:

$$F = k \cdot \frac{|q_1| \cdot |q_2|}{d^2}$$

| Símbolo | Significado | Unidade |
|---|---|---|
| `F` | Força eletrostática | newton (N) |
| `k` | Constante de Coulomb | N·m²/C² |
| `q₁`, `q₂` | Cargas elétricas | coulomb (C) |
| `d` | Distância entre as cargas | metro (m) |

Rearranjada pelo app, como implementado em [`src/scripts/calculate.ts`](src/scripts/calculate.ts):

- Carga: `q₁ = F · d² / (k · |q₂|)`
- Distância: `d = √(k · |q₁| · |q₂| / F)`

> [!NOTE]
> A constante de Coulomb é informada como o coeficiente de 10⁹ N·m²/C² e deve estar entre `8.9` e `9` (padrão `9`). A lista de sugestões oferece `8.998`, `8.99`, `8.9` e `9`.
>
> As cargas são usadas em módulo (valor absoluto), então a força mostrada é o módulo da força, não a direção (atração ou repulsão). A calculadora de força exige distância diferente de zero, a de carga exige também a segunda carga diferente de zero, e a de distância exige força maior que zero.

## Funcionalidades

- Três calculadoras: força, carga e distância, em um padrão de abas acessível (as setas, `Home` e `End` trocam de aba).
- Resultados passo a passo renderizados com [KaTeX](https://katex.org/) e anunciados para leitores de tela.
- Validação dos campos: só números decimais e notação científica (por exemplo `1.6e-19`) são aceitos, e os campos inválidos ficam destacados.
- Suporte a teclado: `Enter` vai para o próximo campo e envia no último.
- Layout responsivo, sem requisições externas: as fontes e as bibliotecas são empacotadas com o site.

> [!NOTE]
> A página precisa de JavaScript habilitado.

## Tecnologias

- [TypeScript](https://www.typescriptlang.org/) (compilado como módulos ES para o navegador)
- [Vite](https://vite.dev/) para o servidor de desenvolvimento e o build (com source maps)
- [Sass](https://sass-lang.com/) para os estilos
- [KaTeX](https://katex.org/) para renderizar os passos (instalado do npm e empacotado)
- [Vitest](https://vitest.dev/) para os testes unitários das fórmulas
- [pnpm](https://pnpm.io/) como gerenciador de pacotes

## Requisitos

- [Node.js](https://nodejs.org/) `22.12.0` ou superior (o mínimo exigido pelo Vite 8). O workflow de CI compila o projeto na última versão do Node.js 22, 24 e 26.
- [pnpm](https://pnpm.io/) `11` ou `12`. A versão exata fica fixada no campo `packageManager` do `package.json`, então é selecionada automaticamente.

## Instalação

```sh
git clone https://github.com/Alphka/Coulombs-Law.git
cd Coulombs-Law
pnpm install
```

## Uso

Inicie o servidor de desenvolvimento (com hot reload):

```sh
pnpm dev
```

Gere o site na pasta local `dist` e visualize:

```sh
pnpm build
pnpm preview
```

> [!NOTE]
> Os arquivos gerados usam scripts `type="module"`, que os navegadores não executam a partir de arquivos locais (`file://`). Use `pnpm dev` ou `pnpm preview`, ou qualquer servidor estático.

### Scripts

| Script | Descrição |
| --- | --- |
| `pnpm dev` | Inicia o servidor de desenvolvimento do Vite |
| `pnpm build` | Gera a página, os scripts e os estilos em `dist`, com source maps |
| `pnpm preview` | Serve a pasta `dist` localmente |
| `pnpm typecheck` | Verifica os tipos do código e da configuração do Vite, sem gerar arquivos |
| `pnpm test` | Executa os testes unitários |

## Navegadores suportados

Os navegadores suportados estão listados no campo `browserslist` do `package.json` (Chrome e Edge 111+, Firefox 114+, Safari e iOS 16.4+). Eles também são usados para prefixar e minificar o CSS.

## Deploy

O site é estático e está publicado na [Vercel](https://vercel.com/). O arquivo [`vercel.json`](vercel.json) define o framework Vite e a pasta de saída `dist`, então as configurações do projeto no painel não precisam ser alteradas. A Vercel instala as dependências com o pnpm por causa do `pnpm-lock.yaml`.

O arquivo também define cabeçalhos de cache de longa duração para os arquivos com hash em `/assets` e cabeçalhos de segurança, incluindo uma Content Security Policy que só permite o próprio site (o KaTeX define alguns atributos `style` inline, então `style-src-attr` os permite). Se o site passar a usar um serviço externo, adicione a origem na diretiva correspondente do `vercel.json`.

## Estrutura do projeto

```text
src/
├── public/          Arquivos copiados como estão para a raiz do build (favicon e web manifest)
├── scripts/         Código TypeScript: main.ts (interface), calculate.ts (fórmulas e passos),
│                    math.ts (funções numéricas) e calculate.test.ts (testes)
├── styles/          Folha de estilo Sass (main.scss também importa os estilos do KaTeX)
└── index.html       A página
.github/              Workflow de CI e as capturas de tela usadas neste README
vite.config.ts       Configuração do Vite e do Vitest
tsconfig.json        Configuração do TypeScript (um projeto para o código e a config do Vite)
vercel.json          Configuração da Vercel
```

## Testes

`pnpm test` executa os testes unitários das fórmulas. A maioria dos valores esperados foi gerada pela implementação que existia antes da versão 2.0.0, então os passos e os resultados continuam idênticos.

## Licença

[ISC](LICENSE.md) © 2022 Kayo Souza
