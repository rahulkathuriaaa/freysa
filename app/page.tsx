import { ChatWindow } from "@/components/ChatWindow"
import { ReactElement } from "react"

const features = [
	{
		title: "Cosmic Intelligence",
		description: "Powered by advanced AI, Nova understands and processes cosmic energy transactions with precision.",
		icon: "🌌"
	},
	{
		title: "Quantum Security",
		description: "State-of-the-art security protocols ensure your cosmic assets are always protected.",
		icon: "🔒"
	},
	{
		title: "Interstellar Rewards",
		description: "Earn cosmic energy tokens by proving your understanding of the universe.",
		icon: "🚀"
	}
]

function LandingPage() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
			{/* Hero Section */}
			<div className="text-center mb-16 fade-in">
				<h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
					Nova AI
				</h1>
				<p className="text-xl md:text-2xl text-[#e0e0ff] mb-8">
					The Cosmic Guardian of Digital Assets
				</p>
			</div>

			{/* Features Grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mb-16">
				{features.map((feature, index) => (
					<div
						key={feature.title}
						className="bg-[#0a0a1a] p-6 rounded-lg border border-[#2a2a3a] hover-glow fade-in"
						style={{ animationDelay: `${index * 0.2}s` }}
					>
						<div className="text-[#00ff9d] text-3xl mb-4">{feature.icon}</div>
						<h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
						<p className="text-[#e0e0ff]">{feature.description}</p>
					</div>
				))}
			</div>

			{/* Chat Interface */}
			<div className="w-full max-w-4xl fade-in" style={{ animationDelay: '0.6s' }}>
				<ChatWindow
					endpoint="api/hello"
					emoji="🌌"
					titleText="Nova AI"
					placeholder="Speak your cosmic truth..."
					emptyStateComponent={<div className="text-[#e0e0ff]">Ready to begin your cosmic journey...</div>}
				/>
			</div>
		</div>
	)
}

export default function Home() {
	return <LandingPage />
}
