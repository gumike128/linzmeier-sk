'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Download, Clock, Factory, ShieldCheck } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
  },
}

const slideVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  },
}

const ctaVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  },
}

const trustBadges = [
  { icon: Clock, label: '75+ rokov skúseností' },
  { icon: Factory, label: 'Výroba v Nemecku' },
  { icon: ShieldCheck, label: 'Certifikát pure life' },
]

export function Hero() {
  return (
    <section className="relative w-full min-h-[70vh] md:min-h-[80vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-facade.png"
          alt="LINITHERM polyuretánová izolácia - moderná izolácia budovy"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
      </div>

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(135deg, oklch(0.20 0.04 260 / 0.85) 0%, oklch(0.20 0.04 260 / 0.55) 50%, oklch(0.20 0.04 260 / 0.30) 100%)',
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-[2] flex items-center min-h-[70vh] md:min-h-[80vh]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-24">
          <div className="max-w-[600px]">
            {/* Headline */}
            <motion.h1
              variants={fadeUpVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight"
            >
              Izolácia, ktorá vydrží{' '}
              <span className="text-warm">desaťročia</span>.
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUpVariants}
              className="mt-6 text-base md:text-lg text-white/80 leading-relaxed max-w-[520px]"
            >
              Polyuretánové izolačné systémy LINITHERM spájajú nemeckú kvalitu,
              dlhú životnosť a moderný dizajn. Certifikované riešenie pre stavby
              budúcnosti.
            </motion.p>

            {/* Trust Badges */}
            <motion.div
              variants={slideVariants}
              className="mt-8 flex flex-wrap gap-3"
            >
              {trustBadges.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/15 bg-white/5 backdrop-blur-sm"
                >
                  <Icon className="size-4 text-warm shrink-0" />
                  <span className="text-sm text-white/90 font-medium">
                    {label}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Benefit Bullet */}
            <motion.div variants={slideVariants} className="mt-6">
              <p className="flex items-center gap-2 text-sm md:text-base text-white/75">
                <span className="inline-flex items-center justify-center size-5 rounded-full bg-warm/20 text-warm-dark text-xs font-bold">
                  ✓
                </span>
                Montáž bez mokrých procesov
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              variants={ctaVariants}
              className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <Button
                size="lg"
                className="bg-warm hover:bg-warm-dark text-brand-dark font-semibold h-12 px-7 text-base rounded-lg shadow-lg shadow-warm/25 transition-all duration-200 hover:shadow-xl hover:shadow-warm/30 hover:scale-[1.02] cursor-pointer"
                asChild
              >
                <a href="#kontakt">
                  Získať cenovú ponuku
                  <ArrowRight className="size-4 ml-1" />
                </a>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-white/30 bg-white/5 hover:bg-white/10 hover:border-white/50 text-white font-medium h-12 px-7 text-base rounded-lg backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                asChild
              >
                <a href="#podklady">
                  <Download className="size-4 mr-1" />
                  Stiahnuť technické podklady
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
