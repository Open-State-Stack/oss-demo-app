import { ArrowRight, Github, Star } from "lucide-react"

import { Button } from "@/components/ui/button"

interface HeroSectionProps {
  title: string
  subtitle: string
  badgeText?: string
}

export function HeroSection({ title, subtitle, badgeText }: HeroSectionProps) {
  return (
    <section className="space-y-6 pb-8 pt-12 md:pb-12 md:pt-16 lg:py-24">
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
        {badgeText && (
          <div className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium">
            <span className="text-primary">New Release</span> {badgeText}
          </div>
        )}
        <h1 className="font-heading text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">{title}</h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">{subtitle}</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" className="gap-1.5">
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="gap-1.5">
            <Github className="h-4 w-4" /> Star on GitHub
          </Button>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <span>Over 1,000+ stars on GitHub</span>
        </div>
      </div>
    </section>
  )
}
