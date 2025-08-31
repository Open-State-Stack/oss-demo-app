import { Button } from "@/components/ui/button"

interface CTASectionProps {
  title: string
  subtitle: string
  buttonText: string
  className?: string
}

export function CTASection({ title, subtitle, buttonText, className = "" }: CTASectionProps) {
  return (
    <section className={`py-12 w-full md:py-16 lg:py-24 ${className}`}>
      <div className="container max-w-[1400px] mx-auto">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-heading text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">{title}</h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">{subtitle}</p>
          <Button size="lg" className="mt-4">
            {buttonText}
          </Button>
        </div>
      </div>
    </section>
  )
}
