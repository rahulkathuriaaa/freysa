/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack(config) {
		// Match *.svg?url — import as a raw URL
		config.module.rules.push({
			test: /\.svg$/i,
			resourceQuery: /url/, // *.svg?url
			type: 'asset/resource',
		})

		// Optional: Match plain *.svg — import as React component (SVGR)
		config.module.rules.push({
			test: /\.svg$/i,
			issuer: /\.[jt]sx?$/,
			resourceQuery: { not: [/url/] }, // exclude if *.svg?url
			use: ['@svgr/webpack'],
		})

		return config
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
			},
		],
		unoptimized: true,
	},
}

module.exports = nextConfig
  
  
  