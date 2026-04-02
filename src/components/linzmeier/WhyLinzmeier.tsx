'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import {
  Factory,
  Zap,
  Leaf,
  Building2,
  FileCheck,
  Wrench,
} from 'lucide-react'

const stats = [
  { value: '75+', label: 'Rokov skúseností' },
  { value: '5 000+', label: 'Realizácií' },
  { value: '50+', label: 'Rokov životnosť' },
  { value: '40%', label: 'Úspora energie' },
] as const

const benefits = [
  {
    icon: Factory,
    title: 'Výroba v Nemecku',
    description:
      'Každý LINITHERM panel vyrábame v našich dvoch závodoch v Nemecku s prísnou kontrolou kvality podľa nemeckých noriem.',
  },
  {
    icon: Zap,
    title: 'Rýchla montáž',
    description:
      'Bez mokrých procesov. Suchá montáž znižuje čas realizácie až o 60% v porovnaní s tradičným zateplením.',
  },
  {
    icon: Leaf,
    title: 'Energetická efektívnosť',
    description:
      'Naše systémy znižujú tepelné straty až o 40%, čo prináša výrazné zníženie nákladov na kúrenie.',
  },
  {
    icon: Building2,
    title: 'Systémové riešenie',
    description:
      'Kompletný systém od izolácie po finálnu úpravu z jednej ruky. Žiadne kompromisy v kompatibilite.',
  },
  {
    icon: FileCheck,
    title: 'Certifikát pure life',
    description:
      'Všetky produkty LINITHERM sú certifikované certifikátom pure life pre ekologickú nezávadnosť — bez škodlivých látok, bez CFC/HCFC.',
  },
  {
    icon: Wrench,
    title: 'Lokálna technická podpora',
    description:
      'Technické poradenstvo, montážne návody a podpora pri realizácii priamo na Slovensku.',
  },
] as const

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

const statItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: 'easeOut',
    },
  },
}

export function WhyLinzmeier() {
  return (
    <section className="relative w-full bg-white py-20 md:py-28 overflow-hidden">
      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.15) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="mb-4 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Prečo LINZMEIER?
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          className="mb-4 text-center"
        >
          <p className="text-lg text-neutral-500">
            Čísla a fakty, ktoré hovoria za nás
          </p>
        </motion.div>

        {/* Section divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          className="mx-auto mb-14 h-1 w-20 origin-center rounded-full bg-warm md:mb-16"
        />

        {/* Stats row */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-14 grid grid-cols-2 gap-4 md:mb-16 md:grid-cols-4 md:gap-6"
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={statItemVariants}>
              <Card className="border border-neutral-200 bg-white shadow-sm">
                <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
                  <span className="text-4xl font-bold tracking-tight text-yellow-800 md:text-5xl">
                    {stat.value}
                  </span>
                  <span className="text-sm font-medium text-neutral-500">
                    {stat.label}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Benefits grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <motion.div key={benefit.title} variants={itemVariants}>
                <Card className="group h-full cursor-default border border-neutral-100 bg-white shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <CardContent className="flex flex-col gap-4 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-800 transition-colors duration-300 group-hover:bg-yellow-100">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {benefit.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-neutral-500">
                        {benefit.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
