'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Phone, X, MessageCircle } from 'lucide-react'

export function StickyCta() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (isDismissed) return
      setIsVisible(window.scrollY > 600)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    // Check initial position in case page loads already scrolled
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isDismissed])

  const handleDismiss = useCallback(() => {
    setIsDismissed(true)
    setIsVisible(false)
  }, [])

  const scrollToContact = () => {
    const contactSection = document.getElementById('kontakt')
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          <div className="bg-brand-dark text-white shadow-[0_-4px_24px_rgba(0,0,0,0.15)]">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16">
              {/* Mobile Layout */}
              <div className="flex flex-col sm:hidden py-3 gap-2">
                <button
                  onClick={scrollToContact}
                  className="flex items-center justify-center gap-2 text-sm font-medium text-white/90 hover:text-white transition-colors w-full"
                >
                  <Phone className="size-4 shrink-0 text-warm" />
                  <span>Zavolajte nám</span>
                </button>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={scrollToContact}
                    className="flex-1 bg-warm hover:bg-warm-dark text-brand-dark font-semibold h-11 text-sm rounded-lg transition-colors cursor-pointer"
                  >
                    <MessageCircle className="size-4 mr-2" />
                    Nezáväzná konzultácia
                  </Button>
                  <button
                    onClick={handleDismiss}
                    className="flex items-center justify-center size-9 rounded-lg bg-white/10 hover:bg-white/20 transition-colors shrink-0 cursor-pointer"
                    aria-label="Zavrieť"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:flex items-center justify-between py-3 gap-6">
                <a
                  href="tel:+421903664079"
                  className="flex items-center gap-3 text-white/90 hover:text-white transition-colors group shrink-0"
                >
                  <span className="flex items-center justify-center size-9 rounded-full bg-warm/15 group-hover:bg-warm/25 transition-colors">
                    <Phone className="size-4 text-warm" />
                  </span>
                  <span className="text-sm font-medium hidden md:inline">
                    Zavolajte nám:&nbsp;
                    <span className="text-white">+421 903 664 079</span>
                  </span>
                  <span className="text-sm font-medium md:hidden">
                    Zavolajte nám
                  </span>
                </a>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={scrollToContact}
                    className="bg-warm hover:bg-warm-dark text-brand-dark font-semibold h-10 px-6 text-sm rounded-lg shadow-lg shadow-warm/20 transition-all duration-200 hover:shadow-xl hover:shadow-warm/30 hover:scale-[1.02] cursor-pointer"
                  >
                    <MessageCircle className="size-4 mr-2" />
                    Nezáväzná konzultácia
                  </Button>

                  <button
                    onClick={handleDismiss}
                    className="flex items-center justify-center size-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors shrink-0 cursor-pointer"
                    aria-label="Zavrieť"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
