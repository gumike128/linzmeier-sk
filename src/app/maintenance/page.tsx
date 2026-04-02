import Image from 'next/image'
import { Mail, Phone, Wrench } from 'lucide-react'

export const metadata = {
  title: 'Údržba stránky | LINZMEIER.SK',
  description: 'Stránka je dočasne nedostupná z dôvodu plánovanej údržby.',
}

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/logo.png"
          alt="LINZMEIER Slovakia"
          width={180}
          height={54}
          className="h-14 w-auto"
          priority
        />
      </div>

      {/* Icon */}
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-warm/10">
        <Wrench className="size-10 text-warm-dark" />
      </div>

      {/* Heading */}
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-dark mb-3">
        Stránka je dočasne nedostupná
      </h1>

      {/* Message */}
      <p className="max-w-lg text-muted-foreground leading-relaxed mb-2">
        Pracujeme na vylepšení našich služieb. Stránka sa čoskoro vráti do
        normálneho prevádzkového režimu.
      </p>
      <p className="text-sm text-muted-foreground/70 mb-10">
        Ospravedlňujeme sa za nepríjemnosti a ďakujeme za vašu trpezlivosť.
      </p>

      {/* Contact */}
      <div className="rounded-xl border border-border/60 bg-muted/30 px-6 py-4">
        <p className="text-sm font-medium text-foreground mb-3">
          Potrebujete nás kontaktovať?
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
          <a
            href="mailto:info@linzmeier.sk"
            className="flex items-center gap-2 text-muted-foreground hover:text-brand-dark transition-colors"
          >
            <Mail className="size-4" />
            info@linzmeier.sk
          </a>
          <a
            href="tel:+4212XXXXXXX"
            className="flex items-center gap-2 text-muted-foreground hover:text-brand-dark transition-colors"
          >
            <Phone className="size-4" />
            +421 2 XXX XXX XX
          </a>
        </div>
      </div>

      {/* Admin hint */}
      <p className="mt-8 text-xs text-muted-foreground/50">
        Administrácia:&nbsp;
        <a href="/login" className="underline hover:text-muted-foreground transition-colors">
          Prihlásiť sa
        </a>
      </p>
    </div>
  )
}
