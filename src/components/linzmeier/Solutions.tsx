'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'

interface Solution {
  image: string
  heading: string
  description: string
  benefits: string[]
  cta: string
  href: string
}

const solutions: Solution[] = [
  {
    image: '/images/solution-house.png',
    heading: 'Riešenia pre rodinné domy',
    description:
      'Energeticky efektívne zateplenie pre novostavby aj rekonštrukcie rodinných domov. Polyuretánové izolačné systémy LINITHERM zaručujú minimálne tepelné straty, rýchlu realizáciu a dlhú životnosť fasády bez potreby údržby.',
    benefits: ['Úspora energie až 40%', 'Životnosť 50+ rokov', 'Montáž do 2 týždňov'],
    cta: 'Zobraziť detaily',
    href: '/riesenia/rodinne-domy',
  },
  {
    image: '/images/solution-apartments.png',
    heading: 'Riešenia pre bytové domy',
    description:
      'Kompletné polyuretánové izolačné systémy LINITHERM pre bytové domy a developerské projekty. Ponúkame riešenia splňujúce prísne energetické normy s architektonickou flexibilitou pre každý projekt.',
    benefits: [
      'STN normy splnené',
      'Referencie po celom Slovensku',
      'BIM podklady k dispozícii',
    ],
    cta: 'Zobraziť detaily',
    href: '/riesenia/bytove-domy',
  },
  {
    image: '/images/solution-industrial.png',
    heading: 'Riešenia pre priemysel',
    description:
      'Priemyselné polyuretánové izolačné systémy LINITHERM s vysokou odolnosťou a tepelnou izoláciou. Ideálne pre haly, skladové objekty a výrobné závody s nárokmi na maximálnu energetickú efektívnosť.',
    benefits: ['Veľkoplošné panely', 'Požiarna odolnosť', 'Ekonomická návratnosť'],
    cta: 'Zobraziť detaily',
    href: '/riesenia/priemysel',
  },
  {
    image: '/images/solution-renovation.png',
    heading: 'Riešenia pre rekonštrukcie',
    description:
      'Polyuretánové izolačné systémy LINITHERM pre rýchlu a čistú izoláciu pri rekonštrukciách budov. Bez mokrých procesov, s protihlukovou ochranou LINITHERM PAL SIL T.',
    benefits: [
      'Bez mokrých procesov',
      'Rýchla montáž',
      'Protihluková ochrana',
    ],
    cta: 'Zobraziť detaily',
    href: '/riesenia/rekonstrukcie',
  },
  {
    image: '/images/solution-noise.png',
    heading: 'Ochrana proti hluku',
    description:
      'Účinná protihluková izolácia s polyuretánovými systémami LINITHERM PAL SIL T. Integrovaná akustická vrstva až 50 dB zníženie hluku pre maximálny komfort bývania.',
    benefits: [
      'Až 50 dB zníženie hluku',
      'Integrovaná akustická vrstva',
      'Vylepšený tepelný komfort',
    ],
    cta: 'Zobraziť detaily',
    href: '/riesenia/ochrana-proti-hluku',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

const imageLeftVariants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: 'easeOut',
    },
  },
}

const imageRightVariants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: 'easeOut',
    },
  },
}

export function Solutions() {
  return (
    <section id="solutions" className="bg-muted/50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Riešenia pre každý typ stavby
          </h2>
          <div className="section-divider mx-auto mt-4" />
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Od rodinného domu po priemyselný objekt – máme systémové riešenie presne
            pre váš projekt.
          </p>
        </motion.div>

        {/* Solution Rows */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="space-y-20 md:space-y-28"
        >
          {solutions.map((solution, index) => {
            const isReversed = index % 2 !== 0
            const imageVariants = isReversed
              ? imageRightVariants
              : imageLeftVariants

            return (
              <motion.div
                key={solution.heading}
                variants={itemVariants}
                className="grid items-center gap-10 md:grid-cols-2 md:gap-14 lg:gap-20"
              >
                {/* Image */}
                <motion.div
                  variants={imageVariants}
                  className={`${isReversed ? 'md:order-2' : 'md:order-1'} order-1 relative overflow-hidden rounded-xl shadow-lg`}
                >
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={solution.image}
                      alt={solution.heading}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </motion.div>

                {/* Text Content */}
                <div
                  className={`${isReversed ? 'md:order-1' : 'md:order-2'} order-2 flex flex-col justify-center`}
                >
                  <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {solution.heading}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                    {solution.description}
                  </p>

                  {/* Benefits */}
                  <ul className="mt-6 space-y-3">
                    {solution.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 shrink-0 text-eco" />
                        <span className="text-sm font-medium text-foreground">
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-8">
                    <Link
                      href={solution.href}
                      className="animated-underline group inline-flex items-center gap-2 text-sm font-semibold text-warm-dark transition-colors hover:text-warm-dark"
                    >
                      {solution.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
