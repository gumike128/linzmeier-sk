import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const contactSchema = z.object({
  customerType: z.enum(['architekt', 'firma', 'investor'], {
    errorMap: () => ({ message: 'Neplatný typ zákazníka' }),
  }),
  name: z
    .string()
    .min(2, 'Meno musí mať aspoň 2 znaky')
    .max(100, 'Meno je príliš dlhé'),
  email: z.string().email('Neplatná e-mailová adresa'),
  phone: z
    .string()
    .max(30, 'Telefónne číslo je príliš dlhé')
    .optional()
    .or(z.literal('')),
  projectType: z
    .string()
    .max(200, 'Typ projektu je príliš dlhý')
    .optional()
    .or(z.literal('')),
  company: z
    .string()
    .max(200, 'Názov spoločnosti je príliš dlhý')
    .optional()
    .or(z.literal('')),
  priority: z
    .enum(['low', 'normal', 'high', 'urgent'], {
      errorMap: () => ({ message: 'Neplatná priorita' }),
    })
    .optional(),
  utmSource: z
    .string()
    .max(200, 'UTM Source je príliš dlhý')
    .optional()
    .or(z.literal('')),
  utmMedium: z
    .string()
    .max(200, 'UTM Medium je príliš dlhý')
    .optional()
    .or(z.literal('')),
  utmCampaign: z
    .string()
    .max(200, 'UTM Campaign je príliš dlhý')
    .optional()
    .or(z.literal('')),
  utmContent: z
    .string()
    .max(200, 'UTM Content je príliš dlhý')
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .min(10, 'Správa musí mať aspoň 10 znakov')
    .max(5000, 'Správa je príliš dlhá'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = contactSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Neplatné údaje',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { customerType, name, email, phone, projectType, company, priority, utmSource, utmMedium, utmCampaign, utmContent, message } =
      result.data

    const lead = await db.lead.create({
      data: {
        customerType,
        name,
        email,
        phone: phone || null,
        projectType: projectType || null,
        company: company || null,
        priority: priority || 'normal',
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        utmContent: utmContent || null,
        message,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Ďakujeme za vašu správu. Ozveme sa vám čo najskôr.',
        leadId: lead.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Nastala chyba pri spracovaní vašej požiadavky. Skúste to prosím neskôr.',
      },
      { status: 500 }
    )
  }
}
