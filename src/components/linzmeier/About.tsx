'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Award, Shield, FileCheck, Users, type LucideIcon } from 'lucide-react'

/* ───────────── Data ───────────── */

const paragraphs = [
  'Spoločnosť Linzmeier Bauelemente GmbH je rodinná firma vedená treťou generáciou s bohatou tradíciou od roku 1946. Počas viac ako 75 rokov existencie sme sa stali jedným z vedúcich výrobcov polyuretánových izolačných systémov v Európe.',
  'Naše dva moderné závody v Nemecku využívajú najmodernejšie technológie a prísnu kontrolu kvality. Každý produkt LINITHERM, ktorý opustí našu linku, je certifikovaný certifikátom pure life pre ekologickú nezávadnosť a splňa najvyššie nároky na kvalitu, bezpečnosť a trvácnosť.',
  'Na slovenský trh prinášame nielen produkty, ale aj kompletné technické poradenstvo, BIM podklady a montážne návody v slovenčine. LINITHERM systémy pokrývajú všetky oblasti: šikmá strecha, plochá strecha, izolácia stropu, prevetrávaná fasáda a podlaha.',
]

const milestones = [
  { year: '1946', label: 'Založenie spoločnosti' },
  { year: '1990', label: 'Expanzia produkcie' },
  { year: '2010', label: 'Certifikát pure life' },
  { year: '2020', label: 'Vstup na slovenský trh' },
]

const partners = [
  'STAVO Slovakia',
  'HB Reavis',
  'PORR',
  'STRABAG',
  'IMPRO',
  'Eurovia SK',
]

const trustBadges: { icon: LucideIcon; label: string }[] = [
  { icon: Award, label: 'ISO 9001 Certifikovaný' },
  { icon: Shield, label: 'STN EN 13501-1' },
  { icon: FileCheck, label: 'CE Značka' },
  { icon: Users, label: 'Member of DAF' },
]

/* ───────────── Animation variants ───────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.4, 0.25, 1] },
  },
}

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
}

const milestoneVariant = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

/* ═══════════════════════════════════════════════
   About Section
   ═══════════════════════════════════════════════ */

export function About() {
  return (
    <section id="o-spolocnosti" className="relative bg-white py-20 md:py-28 overflow-hidden">
      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.15) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center md:mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            O spoločnosti LINZMEIER
          </h2>
          <div className="section-divider mx-auto mt-4" />
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Viac ako 75 rokov nemeckej kvality a inovácií v oblasti
            polyuretánovej izolácie.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
            className="flex flex-col gap-5"
          >
            {paragraphs.map((text, i) => (
              <p
                key={i}
                className="text-base leading-relaxed text-muted-foreground"
              >
                {text}
              </p>
            ))}
          </motion.div>

          {/* Right: Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1], delay: 0.1 }}
            className="flex flex-col items-center lg:items-end"
          >
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl shadow-lg shadow-black/[0.06]">
              <Image
                src="/images/about-manufacturing.png"
                alt="Náš výrobný závod v Nemecku"
                width={600}
                height={400}
                className="h-auto w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              Výrobný závod Linzmeier v Nemecku
            </p>
          </motion.div>
        </div>

        {/* Key Milestones */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 md:mt-20"
        >
          {milestones.map((m) => (
            <motion.div key={m.year} variants={milestoneVariant}>
              <Card className="border-border/40 bg-white transition-all duration-300 hover:border-brand/30 hover:shadow-md">
                <CardContent className="flex flex-col items-center gap-1.5 p-5 text-center">
                  <span className="text-3xl font-bold tracking-tight text-warm-dark md:text-4xl">
                    {m.year}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {m.label}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════
   Partners / Trust Section
   ═══════════════════════════════════════════════ */

export function Partners() {
  return (
    <section id="partneri" className="bg-muted/30 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center md:mb-16"
        >
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-warm-dark">
            Partneri
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Dôverujú nám
          </h2>
          <div className="section-divider mx-auto mt-4" />
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Spolupracujeme s poprednými stavebnými firmami, developermi a
            architektmi.
          </p>
        </motion.div>

        {/* Partner Logo Grid – 3×2 on desktop, 2×3 on tablet/mobile */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3"
        >
          {partners.map((name) => (
            <motion.div key={name} variants={cardVariant}>
              <Card className="group flex h-28 items-center justify-center border-border/40 bg-white transition-all duration-300 hover:border-brand/30 hover:shadow-md">
                <CardContent className="flex h-full w-full items-center justify-center p-4">
                  <span className="text-lg font-semibold tracking-wide text-muted-foreground/70 transition-all duration-300 group-hover:text-foreground select-none">
                    {name}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Badges Row */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="mt-14 grid grid-cols-2 gap-4 md:mt-16 sm:grid-cols-4 md:gap-6"
        >
          {trustBadges.map(({ icon: Icon, label }) => (
            <motion.div key={label} variants={fadeUp}>
              <Card className="border-border/40 bg-white transition-all duration-300 hover:border-warm/30 hover:shadow-md">
                <CardContent className="flex flex-col items-center gap-2.5 p-5 text-center">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warm-light/60 text-warm-dark transition-colors duration-300 group-hover:bg-warm-light">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground leading-snug">
                    {label}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
