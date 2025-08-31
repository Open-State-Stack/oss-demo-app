import { Component, FileCode, Lock, Moon, Palette, Rocket } from "lucide-react"

export const featuresData = [
  {
    title: "Next.js 14",
    description: "Built on the latest version of Next.js with App Router support.",
    icon: <Rocket className="h-5 w-5" />,
  },
  {
    title: "TypeScript",
    description: "Built with TypeScript for type safety and better developer experience.",
    icon: <FileCode className="h-5 w-5" />,
  },
  {
    title: "Tailwind CSS",
    description: "Styled with Tailwind CSS for rapid UI development and customization.",
    icon: <Palette className="h-5 w-5" />,
  },
  {
    title: "Components",
    description: "Pre-built components using shadcn/ui for beautiful interfaces.",
    icon: <Component className="h-5 w-5" />,
  },
  {
    title: "Authentication",
    description: "Ready-to-use authentication with multiple providers.",
    icon: <Lock className="h-5 w-5" />,
  },
  {
    title: "Dark Mode",
    description: "Built-in dark mode support with easy toggling.",
    icon: <Moon className="h-5 w-5" />,
  },
]
