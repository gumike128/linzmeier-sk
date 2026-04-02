'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FileText, Boxes, BookOpen, Download, ArrowRight } from 'lucide-react'

const downloads = [
  {
    icon: FileText,
    title: 'Technické listy (PDF)',
    description:
      'Technické dokumentácie, certifikáty a deklarácie vlastností pre všetky naše produkty.',
    count: 12,
    countLabel: 'dokumentov',
    cta: 'Stiahnuť dokumenty',
  },
  {
    icon: Boxes,
    title: 'BIM / CAD podklady',
    description:
      '2D/3D modely a detaily pre projektovanie v CAD a BIM prostredí.',
    count: 24,
    countLabel: 'modelov',
    cta: 'Zobraziť podklady',
  },
  {
    icon: BookOpen,
    title: 'Montážne návody',
    description:
      'Podrobné montážne návody a postupy pre správnu inštaláciu našich systémov.',
    count: 8,
    countLabel: 'návodov',
    cta: 'Stiahnuť návody',
  },
] as const

const faqs = [
  {
    question: 'Aká je životnosť izolačných systémov LINITHERM?',
    answer:
      'Naše polyuretánové izolačné systémy LINITHERM majú životnosť viac ako 50 rokov pri dodržaní montážnych predpisov a pravidelnej údržbe. Používame vysokokvalitný polyuretán vyrábaný v Nemecku, certifikovaný certifikátom pure life pre ekologickú nezávadnosť.',
  },
  {
    question: 'Čo znamená montáž bez mokrých procesov?',
    answer:
      'Montáž bez mokrých procesov znamená, že inštalácia prebieha suchou cestou – bez malty, omietky a čakania na vyschnutie. Výrazne to skracuje dobu realizácie a znižuje náklady na stavebné práce.',
  },
  {
    question: 'Splňujú vaše produkty slovenské normy (STN)?',
    answer:
      'Áno, všetky naše produkty sú certifikované podľa platných slovenských a európskych noriem (STN, EN). Máme k dispozícii všetky potrebné certifikáty a deklarácie.',
  },
  {
    question: 'Aká je dodacia lehota?',
    answer:
      'Štandardná dodacia lehota je 2–4 týždne podľa typu a množstva produktov. Pre väčšie projekty je možná individuálna dohoda o dodacích termínoch.',
  },
  {
    question: 'Ponúkate technickú podporu pri montáži?',
    answer:
      'Áno, poskytujeme kompletnú technickú podporu vrátane poradenstva, montážnych návodov a možnosti dohľadu pri realizácii. Náš tím je k dispozícii aj telefonicky.',
  },
  {
    question: 'Aké sú dostupné produkty LINITHERM?',
    answer:
      'Ponúkame päť hlavných kategórií: šikmá strecha (PAL N+F, PAL SIL T, PGV T), plochá strecha (PAL 2U, PAL FD, PAL Gefälle), izolácia stropu (PAL GK, PAL W), prevetrávaná fasáda a podlaha (PHW, PMV). Katalóg produktov je k dispozícii na stiahnutie.',
  },
  {
    question: 'Je možné objednať vzorky?',
    answer:
      'Áno, vzorky všetkých produktov a dekórov vám radi zašleme poštou alebo si ich môžete vyzdvihnúť osobne. Kontaktujte nás pre objednávku vzoriek.',
  },
  {
    question: 'Ako správne pripraviť podklad pre montáž?',
    answer:
      'Podklad musí byť čistý, suchý, nosný a s rovným povrchom. Podrobné požiadavky na podklad sú uvedené v montážnych návodoch pre konkrétny systém.',
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

const cardVariants = {
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

export function TechSupport() {
  return (
    <section id="podklady" className="relative w-full bg-white py-20 md:py-28 overflow-hidden">
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
            Technická podpora
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
            Všetky potrebné materiály a informácie pre váš projekt na jednom
            mieste.
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

        {/* Part 1: Downloads Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mb-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:mb-24"
        >
          {downloads.map((item) => {
            const Icon = item.icon
            return (
              <motion.div key={item.title} variants={cardVariants}>
                <Card className="group h-full border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-lg">
                  <CardContent className="flex flex-col gap-5 p-6">
                    {/* Icon */}
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-800 transition-colors duration-300 group-hover:bg-yellow-100">
                      <Icon className="h-7 w-7" />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-neutral-500">
                        {item.description}
                      </p>
                    </div>

                    {/* Count badge */}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                        {item.count} {item.countLabel}
                      </span>
                    </div>

                    {/* CTA */}
                    <Button
                      variant="outline"
                      className="mt-auto w-full justify-between border-neutral-200 bg-white text-neutral-900 hover:border-yellow-400 hover:bg-yellow-100 hover:text-yellow-800 transition-colors duration-200"
                    >
                      <span className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        {item.cta}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Part 2: FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="mb-10 text-center md:mb-12"
        >
          <h3 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Časté otázky
          </h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
          className="mx-auto max-w-3xl"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="border-neutral-200"
              >
                <AccordionTrigger className="group/trigger text-left text-base font-medium text-neutral-900 hover:no-underline data-[state=open]:text-yellow-800 transition-colors duration-200 py-5">
                  <span className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yellow-100 text-sm font-bold text-yellow-800 group-data-[state=open]/trigger:bg-yellow-100 transition-colors duration-200">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="pt-1">{faq.question}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pl-12 text-sm leading-relaxed text-neutral-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
