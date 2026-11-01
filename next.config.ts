import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const isDevelopment = process.env.NODE_ENV === "development"

const config: NextConfig = {
	cacheComponents: true,
	headers(){
		return [
			{
				source: "/:path*",
				headers: [
					{
						key: "Content-Security-Policy",
						value: [
							"default-src 'self'",
							`script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
							"style-src 'self' 'unsafe-inline'",
							"img-src 'self' blob: data:",
							"font-src 'self'",
							"connect-src 'self'",
							"manifest-src 'self'",
							"object-src 'none'",
							"base-uri 'self'",
							"form-action 'self'",
							"frame-ancestors 'none'"
						].join("; ")
					},
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=(), interest-cohort=()"
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin"
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff"
					},
					{
						key: "X-DNS-Prefetch-Control",
						value: "on"
					},
					{
						key: "X-Frame-Options",
						value: "DENY"
					}
				]
			}
		]
	},
	partialPrefetching: true,
	productionBrowserSourceMaps: true,
	reactStrictMode: true,
	typedRoutes: true
}

const withNextIntl = createNextIntlPlugin({
	experimental: {
		messages: {
			path: "./messages",
			format: "json",
			locales: "infer",
			precompile: true
		},
		createMessagesDeclaration: [
			"./messages/en.json",
			"./messages/pt-BR.json"
		]
	}
})

export default withNextIntl(config)
