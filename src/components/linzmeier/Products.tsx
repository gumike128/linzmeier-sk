'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Zap,
  Clock,
  Shield,
  Layers,
  Ruler,
  Award,
  Home,
  Thermometer,
  Volume2,
  type LucideIcon,
} from 'lucide-react'

interface ProductIcon {
  icon: LucideIcon
  label: string
}

interface Product {
  title: string
  description: string
  image?: string
  icons: ProductIcon[]
  tags: string[]
}

const products: Product[] = [
  {
    title: 'Šikmá strecha',
    description:
      'Polyuretánové izolačné panely LINITHERM pre šikmé strechy s vynikajúcimi tepelnými vlastnosťami. Rýchla montáž, dlhá životnosť a minimálne tepelné straty.',
    image: '/images/product-panels.png',
    icons: [
      { icon: Home, label: 'Strešný systém' },
      { icon: Zap, label: 'Úspora energie' },
      { icon: Shield, label: 'Dlhá životnosť' },
    ],
    tags: ['Novostavby', 'Rekonštrukcie'],
  },
  {
    title: 'Plochá strecha',
    description:
      'Kompletné ploché strešné systémy LINITHERM pre priemyselné aj komerčné budovy. Systémové riešenie od tepelnej izolácie po finálnu strešnú krytinu.',
    image: '/images/product-facade.png',
    icons: [
      { icon: Layers, label: 'Systémové riešenie' },
      { icon: Ruler, label: 'Presnosť' },
      { icon: Award, label: 'Certifikované' },
    ],
    tags: ['Kompletné riešenie', 'STN certifikované'],
  },
  {
    title: 'Izolácia stropu',
    description:
      'Polyuretánové izolačné panely LINITHERM pre izoláciu stropov a podkroví. Vysoká tepelná odolnosť a protihluková ochrana pre maximálny komfort bývania.',
    icons: [
      { icon: Thermometer, label: 'Tepelná izolácia' },
      { icon: Volume2, label: 'Protihluk' },
      { icon: Zap, label: 'Energetická úspora' },
    ],
    tags: ['Podkrovia', 'Stropy'],
  },
  {
    title: 'Prevetrávaná fasáda',
    description:
      'Prevetrávané fasádne systémy LINITHERM pre optimálnu tepelnú reguláciu a ochranu budovy. Certifikované riešenia pre novostavby aj rekonštrukcie.',
    image: '/images/product-boards.png',
    icons: [
      { icon: Shield, label: 'Ochrana budovy' },
      { icon: Clock, label: 'Rýchla montáž' },
      { icon: Award, label: 'Certifikované' },
    ],
    tags: ['Novostavby', 'Rekonštrukcie'],
  },
  {
    title: 'Podlaha',
    description:
      'Polyuretánové izolačné systémy LINITHERM pre podlahové izolácie. Eliminácia tepelných mostov, ochrana proti vlhkosti a vysoká nosnosť.',
    icons: [
      { icon: Layers, label: 'Tepelná izolácia' },
      { icon: Shield, label: 'Ochrana' },
      { icon: Ruler, label: 'Presnosť' },
    ],
    tags: ['Priemysel', 'Komercia'],
  },
]

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

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

export function Products() {
  return (
    <section id="produkty" className="relative py-24 bg-white grid-pattern overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-dark mb-4">
            Naše produkty
          </h2>
          <div className="section-divider mx-auto mb-6" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Komplexný systém polyuretánových izolačných riešení LINITHERM z jednej ruky
          </p>
        </motion.div>

        {/* Product Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {products.map((product) => (
            <motion.div
              key={product.title}
              variants={cardVariants}
              className="group"
            >
              <Card className="h-full overflow-hidden border border-border/50 bg-card hover:shadow-lg hover:shadow-brand/5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] py-0 gap-0">
                {/* Product Image / Icon Area */}
                {product.image ? (
                  <div className="relative aspect-video overflow-hidden rounded-t-xl">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                ) : (
                  <div className="relative aspect-video overflow-hidden rounded-t-xl bg-gradient-to-br from-brand/10 via-warm-light/30 to-eco-light/20 flex items-center justify-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/80 shadow-sm">
                      <Layers className="w-8 h-8 text-brand" />
                    </div>
                    <div className="absolute top-3 right-3 w-20 h-20 rounded-full bg-warm/10 blur-2xl" />
                    <div className="absolute bottom-3 left-3 w-16 h-16 rounded-full bg-brand/10 blur-2xl" />
                  </div>
                )}

                {/* Content */}
                <CardContent className="p-5 flex flex-col gap-4">
                  <h3 className="text-lg font-semibold text-brand-dark leading-snug">
                    {product.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>

                  {/* Icon Row */}
                  <div className="flex items-center gap-4">
                    {product.icons.map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-warm-light/60">
                          <Icon className="w-4 h-4 text-warm-dark" />
                        </div>
                        <span className="text-[10px] text-muted-foreground text-center leading-tight font-medium">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-auto pt-1">
                    {product.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs bg-warm-light/50 text-warm-dark border-0 font-medium"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
