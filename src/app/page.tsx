'use client'

import { Header } from '@/components/linzmeier/Header'
import { Hero } from '@/components/linzmeier/Hero'
import { Products } from '@/components/linzmeier/Products'
import { Solutions } from '@/components/linzmeier/Solutions'
import { WhyLinzmeier } from '@/components/linzmeier/WhyLinzmeier'
import { References } from '@/components/linzmeier/References'
import { About, Partners } from '@/components/linzmeier/About'
import { TechSupport } from '@/components/linzmeier/TechSupport'
import { LeadForm } from '@/components/linzmeier/LeadForm'
import { Footer } from '@/components/linzmeier/Footer'
import { StickyCta } from '@/components/linzmeier/StickyCta'
import { ChatbotWidget } from '@/components/linzmeier/ChatbotWidget'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <Hero />
      <Products />
      <Solutions />
      <WhyLinzmeier />
      <References />
      <About />
      <Partners />
      <TechSupport />
      <LeadForm />
      <Footer />
      <StickyCta />
      <ChatbotWidget />
    </main>
  )
}
