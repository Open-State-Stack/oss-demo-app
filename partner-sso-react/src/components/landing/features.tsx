import type React from "react"

interface Feature {
  title: string
  description: string
  icon: React.ReactNode
}

interface FeaturesSectionProps {
  title: string
  subtitle: string
  features: Feature[]
}

export function FeaturesSection({ title, subtitle, features }: FeaturesSectionProps) {
  return (
    <section className="container space-y-6 py-8 md:py-12 lg:py-24">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <h2 className="font-heading text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">{title}</h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">{subtitle}</p>
      </div>
      <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-4">
        {features.map((feature) => (
          <div key={feature.title} className="relative overflow-hidden rounded-lg border bg-background p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">{feature.icon}</div>
            <h3 className="mt-4 font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
