import Link from 'next/link'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import {
  Linkedin,
  Facebook,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Globe,
} from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────────────
const productLinks = [
  { label: 'Izolačné panely', href: '/produkty/izolacne-panely' },
  { label: 'Fasádne systémy', href: '/produkty/fasadne-systemy' },
  { label: 'Priečelové dosky', href: '/produkty/priecelove-dosky' },
  { label: 'Príslušenstvo', href: '/produkty/prislusenstvo' },
]

const companyLinks = [
  { label: 'O spoločnosti', href: '/#o-spolocnosti' },
  { label: 'Referencie', href: '/referencie' },
  { label: 'Technická podpora', href: '/technicka-podpora' },
  { label: 'Kariéra', href: '/kariera' },
  { label: 'Kontakt', href: '/#kontakt' },
  { label: 'Administrácia', href: '/login', subtle: true },
]

const legalLinks = [
  { label: 'Ochrana osobných údajov', href: '/ochrana-osobnych-udajov' },
  { label: 'Imprint', href: '/imprint' },
]

const socialLinks = [
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
]

// ─── Footer component ────────────────────────────────────────────────
export function Footer() {
  return (
    <footer className="bg-brand-dark text-white/80 mt-auto">
      {/* ── Main grid ────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-0">
          {/* Column 1: Brand */}
          <div className="lg:pr-8">
            <div className="mb-4">
              <Image
                src="/logo.png"
                alt="Linzmeier Bauelemente GmbH"
                width={140}
                height={42}
                className="h-10 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-6 max-w-xs">
              Prémiová polyuretánová izolácia LINITHERM pre stavebníctvo.
              Výroba v Nemecku od roku 1946.
            </p>

            {/* Social icons + mother company link */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex items-center justify-center size-9 rounded-md bg-white/10 text-white/60 hover:bg-white/15 hover:text-warm transition-colors"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
              <a
                href="https://www.linzmeier.de"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/50 hover:text-warm transition-colors"
              >
                <Globe className="size-3.5" />
                www.linzmeier.de
              </a>
            </div>
          </div>

          {/* Column 2: Produkty */}
          <div className="lg:pl-8 lg:border-l lg:border-white/10">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Produkty
            </h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-warm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Spoločnosť */}
          <div className="lg:px-8 lg:border-l lg:border-white/10">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Spoločnosť
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${
                      'subtle' in link && link.subtle
                        ? 'text-white/30 hover:text-white/50'
                        : 'text-white/60 hover:text-warm'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Kontakt */}
          <div className="lg:pl-8 lg:border-l lg:border-white/10">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Kontakt
            </h3>
            <ul className="space-y-3">
              <li className="text-sm font-medium text-white">
                Linzmeier Bauelemente GmbH
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <MapPin className="size-4 shrink-0 mt-0.5 text-white/40" />
                <span>
                  Hlavná 123
                  <br />
                  811 01 Bratislava
                </span>
              </li>
              <li>
                <a
                  href="mailto:marian.melis@linzmeier.sk"
                  className="flex items-center gap-2.5 text-sm text-white/60 hover:text-warm transition-colors"
                >
                  <Mail className="size-4 shrink-0 text-white/40" />
                  marian.melis@linzmeier.sk
                </a>
              </li>
              <li>
                <a
                  href="tel:+421903664079"
                  className="flex items-center gap-2.5 text-sm text-white/60 hover:text-warm transition-colors"
                >
                  <Phone className="size-4 shrink-0 text-white/40" />
                  +421 903 664 079
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────── */}
      <Separator className="bg-white/10" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            &copy; 2026 Linzmeier Bauelemente GmbH. Všetky práva vyhradené.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {legalLinks.map((link, index) => (
              <span key={link.label} className="flex items-center gap-x-4">
                {index > 0 && (
                  <Separator orientation="vertical" className="h-3 bg-white/20" />
                )}
                <Link
                  href={link.href}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
