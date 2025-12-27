// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

// We explicitly type 'req' as a Request object
serve(async (req: Request) => {
  try {
    const { record } = await req.json()

    if (record.verification_status === 'pending') {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev', // Use this exactly for testing/free tier
          to: ['torymichaels1@gmail.com'], // Your specific admin email
          subject: `New Verification Request: ${record.username}`,
          html: `<p>User <strong>@${record.username}</strong> wants to be verified.</p>
                 <a href="http://localhost:5173/admin">Go to Admin Panel</a>`
        })
      })
    }
    return new Response("Email sent", { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify(error), { status: 500 })
  }
})