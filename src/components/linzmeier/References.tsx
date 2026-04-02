'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Building2, Layers } from 'lucide-react'

interface Reference {
  id: string
  title: string
  description: string
  type: 'Rodinný dom' | 'Bytový dom' | 'Priemysel'
  location: string
  system: string
  gradient: string
}

const references: Reference[] = [
  {
    id: 'bratislava',
    title: 'Rodinný dom Bratislava',
    description:
      'Kompletná rekonštrukcia fasády rodinného domu s použitím systému LINITHERM.',
    type: 'Rodinný dom',
    location: 'Bratislava',
    system: 'LINITHERM',
    gradient: 'from-warm/40 to-warm-dark/60',
  },
  {
    id: 'kosice',
    title: 'Bytový dom Košice',
    description:
      'Fasádne riešenie pre 48-bytový dom vrátane zateplenia a novej fasády.',
    type: 'Bytový dom',
    location: 'Košice',
    system: 'Fasádny systém',
    gradient: 'from-brand-light/40 to-brand/50',
  },
  {
    id: 'zilina',
    title: 'Priemyselná hala Žilina',
    description:
      'Zateplenie výrobnej haly s požiarnou odolnosťou REI 60.',
    type: 'Priemysel',
    location: 'Žilina',
    system: 'Priemyselný panel',
    gradient: 'from-eco/40 to-eco-light/50',
  },
  {
    id: 'banskabystrica',
    title: 'Polyfunkčný objekt Banská Bystrica',
    description:
      'Novostavba s kompletným fasádnym systémom a prémiovými doskami.',
    type: 'Bytový dom',
    location: 'Banská Bystrica',
    system: 'Priečelové dosky',
    gradient: 'from-brand-light/30 to-brand-dark/40',
  },
  {
    id: 'tatry',
    title: 'Rodinný dom High Tatras',
    description:
      'Energeticky pasívny rodinný dom s maximálnou izoláciou.',
    type: 'Rodinný dom',
    location: 'Vysoké Tatry',
    system: 'LINITHERM',
    gradient: 'from-warm/30 to-warm-light/40',
  },
  {
    id: 'trnava',
    title: 'Logistické centrum Trnava',
    description:
      'Veľkoplošné zateplenie logistického centra 5 000 m².',
    type: 'Priemysel',
    location: 'Trnava',
    system: 'Priemyselný panel',
    gradient: 'from-eco-light/40 to-eco/50',
  },
]

const filterTypes = [
  { key: 'all', label: 'Všetky' },
  { key: 'Rodinný dom', label: 'Rodinné domy' },
  { key: 'Bytový dom', label: 'Bytové domy' },
  { key: 'Priemysel', label: 'Priemysel' },
] as const

type FilterKey = (typeof filterTypes)[number]['key']

function getTypeBadgeClasses(type: Reference['type']): string {
  switch (type) {
    case 'Rodinný dom':
      return 'bg-warm/15 text-warm-dark-dark border-warm/30 hover:bg-warm/25'
    case 'Bytový dom':
      return 'bg-brand-light/15 text-brand border-brand-light/30 hover:bg-brand-light/25'
    case 'Priemysel':
      return 'bg-eco/15 text-eco border-eco/30 hover:bg-eco/25'
  }
}

function getTypeIcon(type: Reference['type']) {
  switch (type) {
    case 'Rodinný dom':
      return Building2
    case 'Bytový dom':
      return Building2
    case 'Priemysel':
      return Layers
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export function References() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  const filteredReferences =
    activeFilter === 'all'
      ? references
      : references.filter((r) => r.type === activeFilter)

  return (
    <section id="referencie" className="bg-muted/30 py-20 md:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-warm-dark">
              Referencie
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Naše realizácie
            </h2>
            <div className="section-divider mx-auto mt-4" />
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Projekty, ktoré dôkazujú našu kvalitu po celom Slovensku
            </p>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-10 flex justify-center"
        >
          <div className="inline-flex items-center gap-1 rounded-xl bg-background p-1.5 shadow-sm border border-border/50">
            {filterTypes.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  activeFilter === filter.key
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {activeFilter === filter.key && (
                  <motion.span
                    layoutId="activeRefTab"
                    className="absolute inset-0 rounded-lg bg-muted shadow-sm"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
                <span className="relative z-10">{filter.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Reference Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredReferences.map((ref) => {
              const TypeIcon = getTypeIcon(ref.type)
              return (
                <motion.div
                  key={ref.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  <Card className="group cursor-pointer overflow-hidden border-border/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-black/[0.06] hover:border-border">
                    {/* Gradient Placeholder Image */}
                    <div className="relative h-48 overflow-hidden">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${ref.gradient}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      {/* Building icon overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <TypeIcon className="h-16 w-16 text-white/30" />
                      </div>
                      {/* Type badge on image */}
                      <div className="absolute top-3 left-3">
                        <Badge
                          variant="outline"
                          className={`backdrop-blur-sm text-xs font-medium ${getTypeBadgeClasses(ref.type)}`}
                        >
                          <TypeIcon className="mr-1 h-3 w-3" />
                          {ref.type}
                        </Badge>
                      </div>
                    </div>

                    {/* Card Content */}
                    <CardContent className="p-5 pt-4">
                      <h3 className="mb-2 text-lg font-semibold leading-tight text-foreground group-hover:text-brand transition-colors duration-300">
                        {ref.title}
                      </h3>
                      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                        {ref.description}
                      </p>

                      {/* Metadata Badges */}
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className="gap-1 bg-muted/50 text-xs font-normal text-muted-foreground"
                        >
                          <MapPin className="h-3 w-3 text-warm-dark" />
                          {ref.location}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="gap-1 bg-muted/50 text-xs font-normal text-muted-foreground"
                        >
                          <Layers className="h-3 w-3 text-brand" />
                          {ref.system}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        <AnimatePresence>
          {filteredReferences.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center"
            >
              <p className="text-muted-foreground">
                Žiadne projekty v tejto kategórii.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
