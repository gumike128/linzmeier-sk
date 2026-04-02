// Email service stub for Phase 1
// In production, integrate with Resend, SendGrid, or nodemailer

interface EmailPayload {
  to: string
  subject: string
  html: string
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  // Phase 1: Log email instead of sending
  console.log(`[EMAIL] To: ${payload.to} | Subject: ${payload.subject}`)
  console.log(`[EMAIL] Body: ${payload.html.substring(0, 100)}...`)
  
  // TODO Phase 2: Integrate with real email service
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({ from: 'info@linzmeier.sk', ...payload })
  
  return true
}

export function getLeadConfirmationTemplate(name: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a2e;">Ďakujeme, ${name}!</h1>
      <p>Vaša žiadosť o cenovú ponuku bola úspešne odoslaná.</p>
      <p>Náš tím sa vám ozve do <strong>24 hodín</strong>.</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #666; font-size: 14px;">
        LINZMEIER Slovakia s.r.o.<br />
        Bratislava, Slovensko<br />
        info@linzmeier.sk
      </p>
    </div>
  `
}

export function getNewLeadNotificationTemplate(leadName: string, leadEmail: string): string {
  return `
    <div style="font-family: sans-serif;">
      <h2 style="color: #1a1a2e;">🔔 Nový lead</h2>
      <p><strong>Meno:</strong> ${leadName}</p>
      <p><strong>Email:</strong> ${leadEmail}</p>
      <p>Prihláste sa do admin panelu pre detail.</p>
    </div>
  `
}
