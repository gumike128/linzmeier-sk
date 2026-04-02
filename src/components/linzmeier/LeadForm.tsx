'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Phone,
  Mail,
  MapPin,
  Upload,
  Send,
  CheckCircle,
  Clock,
  X,
  FileText,
  Building2,
  HardHat,
  TrendingUp,
} from 'lucide-react'
import { saveUtmFromUrl, getUtmFromCookies } from '@/lib/utm'

const customerTypes = [
  {
    value: 'architekt',
    label: 'Architekt / Projektant',
    icon: Building2,
  },
  {
    value: 'firma',
    label: 'Stavebná firma / Montážnik',
    icon: HardHat,
  },
  {
    value: 'investor',
    label: 'Developer / Investor',
    icon: TrendingUp,
  },
] as const

const contactInfo = [
  {
    icon: Phone,
    text: '+421 903 664 079',
    href: 'tel:+421903664079',
  },
  {
    icon: Mail,
    text: 'marian.melis@linzmeier.sk',
    href: 'mailto:marian.melis@linzmeier.sk',
  },
  {
    icon: MapPin,
    text: 'Bratislava, Slovensko',
    href: undefined,
  },
] as const

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function LeadForm() {
  const [customerType, setCustomerType] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    message: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Save UTM params from URL to cookie on mount
  useEffect(() => {
    saveUtmFromUrl()
  }, [])

  const handleInputChange = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev }
          delete next[field]
          return next
        })
      }
    },
    [errors]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null
      const allowed = ['.pdf', '.dwg', '.jpg', '.png']
      if (file && !allowed.some((ext) => file.name.toLowerCase().endsWith(ext))) {
        toast.error('Nepodporovaný formát súboru', {
          description: 'Prijímame: PDF, DWG, JPG, PNG',
        })
        return
      }
      setSelectedFile(file)
      if (errors.file) {
        setErrors((prev) => {
          const next = { ...prev }
          delete next.file
          return next
        })
      }
    },
    [errors]
  )

  const removeFile = useCallback(() => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!customerType) {
      newErrors.customerType = 'Vyberte typ zákazníka'
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Meno a priezvisko je povinné'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail je povinný'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Zadajte platný e-mail'
    }
    if (!formData.projectType) {
      newErrors.projectType = 'Vyberte typ projektu'
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Správa je povinná'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [customerType, formData])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validate()) {
        toast.error('Chyba vo formulári', {
          description: 'Prosím, skontrolujte povinné polia.',
        })
        return
      }

      setIsSubmitting(true)

      // Get UTM data from cookies
      const utmData = getUtmFromCookies()

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerType,
            name: formData.name,
            email: formData.email,
            phone: formData.phone || undefined,
            projectType: formData.projectType || undefined,
            message: formData.message,
            utmSource: utmData?.utm_source || undefined,
            utmMedium: utmData?.utm_medium || undefined,
            utmCampaign: utmData?.utm_campaign || undefined,
            utmContent: utmData?.utm_content || undefined,
          }),
        })

        if (res.status === 201) {
          // Fire Google Ads conversion event (if gtag is loaded)
          if (typeof window !== 'undefined' && typeof (window as unknown as Record<string, unknown>).gtag === 'function') {
            const gtag = (window as unknown as Record<string, (...args: unknown[]) => void>).gtag
            gtag('event', 'conversion', {
              send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
              value: 1.0,
              currency: 'EUR',
            })
            gtag('event', 'lead_form_submit', {
              event_category: 'engagement',
              event_label: 'contact_form',
            })
          }

          toast.success('Žiadosť odoslaná!', {
            description:
              'Ďakujeme za vašu žiadosť. Ozveme sa vám do 24 hodín.',
          })

          // Reset form
          setCustomerType('')
          setFormData({
            name: '',
            email: '',
            phone: '',
            projectType: '',
            message: '',
          })
          setSelectedFile(null)
          setErrors({})
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        } else {
          toast.error('Chyba pri odosielaní', {
            description: 'Nastala chyba. Skúste to prosím neskôr.',
          })
        }
      } catch {
        toast.error('Chyba pri odosielaní', {
          description: 'Nepodarilo sa spojiť so serverom.',
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [validate, customerType, formData]
  )

  return (
    <section id="kontakt" className="relative w-full bg-brand-dark py-20 md:py-28 overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-warm/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-brand-light/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="mb-4 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Požiadajte o cenovú ponuku
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          className="mb-4 text-center"
        >
          <p className="mx-auto max-w-2xl text-lg text-white/70">
            Ozvite sa nám a získajte bezplatnú konzultáciu a cenovú ponuku presne
            pre váš projekt.
          </p>
        </motion.div>

        {/* Section divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          className="mx-auto mb-14 h-1 w-20 origin-center rounded-full bg-warm md:mb-16"
        />

        {/* Two-column layout */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left column - Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-col justify-center"
          >
            {/* Compelling text */}
            <motion.div variants={staggerItem} className="mb-10">
              <h3 className="mb-4 text-2xl font-bold text-white">
                Naši odborníci sú vám k dispozícii
              </h3>
              <p className="leading-relaxed text-white/70">
                Bez ohľadu na to, či plánujete novostavbu, rekonštrukciu alebo
                priemyselný projekt – radi vám poradíme s výberom optimálneho
                riešenia.
              </p>
            </motion.div>

            {/* Contact info cards */}
            <motion.div
              variants={staggerItem}
              className="mb-8 flex flex-col gap-4"
            >
              {contactInfo.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.text}
                    className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4 transition-colors duration-300 hover:border-warm/30 hover:bg-white/10"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warm/20 text-warm-dark">
                      <Icon className="h-5 w-5" />
                    </div>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-white transition-colors duration-200 hover:text-warm"
                      >
                        {item.text}
                      </a>
                    ) : (
                      <span className="text-white">{item.text}</span>
                    )}
                  </div>
                )
              })}
            </motion.div>

            {/* Response time badge */}
            <motion.div
              variants={staggerItem}
              className="inline-flex w-fit items-center gap-3 rounded-xl border border-eco/30 bg-eco/10 px-5 py-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-eco/20">
                <Clock className="h-5 w-5 text-eco-light" />
              </div>
              <div>
                <p className="font-semibold text-white">Odpovieme do 24 hodín</p>
                <p className="text-sm text-white/60">
                  Rýchla a odborná odpoveď na váš dopyt
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right column - Form */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.15 }}
          >
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8"
            >
              {/* Customer type selector */}
              <div className="mb-6">
                <Label className="mb-3 block text-sm font-medium text-white">
                  Som
                </Label>
                <RadioGroup
                  value={customerType}
                  onValueChange={(val) => {
                    setCustomerType(val)
                    if (errors.customerType) {
                      setErrors((prev) => {
                        const next = { ...prev }
                        delete next.customerType
                        return next
                      })
                    }
                  }}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                >
                  {customerTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = customerType === type.value
                    return (
                      <label
                        key={type.value}
                        htmlFor={`type-${type.value}`}
                        className={`relative flex cursor-pointer flex-col items-center gap-2 rounded-xl border px-4 py-4 text-center transition-all duration-200 ${
                          isSelected
                            ? 'border-warm bg-warm/15 text-white shadow-lg shadow-warm/10'
                            : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40 hover:bg-white/10'
                        }`}
                      >
                        <RadioGroupItem
                          value={type.value}
                          id={`type-${type.value}`}
                          className="sr-only"
                        />
                        <Icon
                          className={`h-5 w-5 transition-colors duration-200 ${
                            isSelected ? 'text-warm' : 'text-white/50'
                          }`}
                        />
                        <span className="text-xs font-medium leading-tight">
                          {type.label}
                        </span>
                        {isSelected && (
                          <CheckCircle className="absolute -right-1.5 -top-1.5 h-4 w-4 text-warm" />
                        )}
                      </label>
                    )
                  })}
                </RadioGroup>
                {errors.customerType && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.customerType}
                  </p>
                )}
              </div>

              {/* Name & Email row */}
              <div className="mb-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-white"
                  >
                    Meno a priezvisko <span className="text-warm">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ján Novák"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-warm/50 focus-visible:border-warm/50"
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-white"
                  >
                    E-mail <span className="text-warm">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jan@firma.sk"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-warm/50 focus-visible:border-warm/50"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-400">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone & Project type row */}
              <div className="mb-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label
                    htmlFor="phone"
                    className="mb-1.5 block text-sm font-medium text-white"
                  >
                    Telefón
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+421 9XX XXX XXX"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-warm/50 focus-visible:border-warm/50"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm font-medium text-white">
                    Typ projektu
                  </Label>
                  <Select
                    value={formData.projectType}
                    onValueChange={(val) =>
                      handleInputChange('projectType', val)
                    }
                  >
                    <SelectTrigger className="h-11 w-full bg-white/10 border-white/20 text-white data-[placeholder]:text-white/40 focus:ring-warm/50 focus:border-warm/50">
                      <SelectValue placeholder="Vyberte typ projektu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Novostavba</SelectItem>
                      <SelectItem value="reconstruction">
                        Rekonštrukcia
                      </SelectItem>
                      <SelectItem value="industrial">Priemysel</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.projectType && (
                    <p className="mt-1.5 text-xs text-red-400">
                      {errors.projectType}
                    </p>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="mb-4">
                <Label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-white"
                >
                  Správa / Popis projektu <span className="text-warm">*</span>
                </Label>
                <Textarea
                  id="message"
                  placeholder="Popíšte váš projekt, rozlohu, požiadavky na izoláciu..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-warm/50 focus-visible:border-warm/50 resize-none"
                />
                {errors.message && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.message}
                  </p>
                )}
              </div>

              {/* File upload */}
              <div className="mb-6">
                <Label className="mb-1.5 block text-sm font-medium text-white">
                  Priložiť súbor
                </Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.dwg,.jpg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-warm/30 bg-warm/10 px-4 py-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="h-5 w-5 shrink-0 text-warm" />
                      <span className="truncate text-sm text-white">
                        {selectedFile.name}
                      </span>
                      <span className="shrink-0 text-xs text-white/50">
                        {(selectedFile.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="shrink-0 rounded-full p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-white/20 bg-white/5 px-4 py-6 transition-all duration-200 hover:border-white/40 hover:bg-white/10"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                      <Upload className="h-5 w-5 text-white/50" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-white/70">
                        Kliknite pre nahranie súboru
                      </p>
                      <p className="mt-0.5 text-xs text-white/40">
                        PDF, DWG, JPG, PNG
                      </p>
                    </div>
                  </button>
                )}
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full bg-warm text-brand-dark font-semibold text-base transition-all duration-200 hover:bg-warm-dark disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Odosiela sa...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Odoslať žiadosť
                  </span>
                )}
              </Button>

              {/* GDPR note */}
              <p className="mt-4 text-center text-xs leading-relaxed text-white/40">
                Odoslaním formulára súhlasíte so spracovaním osobných údajov.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
