const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const BREVO_API = 'https://api.brevo.com/v3/smtp/email'

export async function sendInviteEmail({
  employeeName,
  employeeEmail,
  companyName,
  jobRole,
  inviteToken,
}: {
  employeeName: string
  employeeEmail: string
  companyName: string
  jobRole: string
  inviteToken: string
}) {
  const inviteUrl = `${APP_URL}/invite/${inviteToken}`

  const res = await fetch(BREVO_API, {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY!,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME || 'FlashPay Private',
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ name: employeeName, email: employeeEmail }],
      subject: `You've been added to ${companyName}'s payroll on FlashPay`,
      htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#0a0b0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 16px;">

    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:10px;">
        <img src="${APP_URL}/logo.png" alt="FlashPay" width="36" height="36" style="border-radius:10px;display:block;" />
        <span style="color:white;font-size:20px;font-weight:700;">FlashPay <span style="color:#a78bfa;">Private</span></span>
      </div>
    </div>

    <div style="background:#0f1117;border:1px solid rgba(100,116,139,0.3);border-radius:16px;padding:40px;">
      <h1 style="color:#f1f5f9;font-size:24px;font-weight:700;margin:0 0 8px;">You're on the payroll 🎉</h1>
      <p style="color:#94a3b8;font-size:15px;margin:0 0 28px;line-height:1.6;">
        <strong style="color:#c4b5fd;">${companyName}</strong> has added you as
        <strong style="color:#e2e8f0;">${jobRole}</strong>. Complete your onboarding
        to receive confidential salary payments via Solana.
      </p>

      <div style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);border-radius:12px;padding:20px;margin-bottom:28px;">
        <p style="color:#94a3b8;font-size:13px;margin:0 0 12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">What happens next</p>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div style="display:flex;gap:10px;align-items:flex-start;">
            <span style="color:#10b981;font-size:14px;margin-top:1px;">✓</span>
            <span style="color:#cbd5e1;font-size:14px;">Connect your Solana wallet (or get one generated for free)</span>
          </div>
          <div style="display:flex;gap:10px;align-items:flex-start;">
            <span style="color:#10b981;font-size:14px;margin-top:1px;">✓</span>
            <span style="color:#cbd5e1;font-size:14px;">Your salary is encrypted by Arcium MPC — only you can see it</span>
          </div>
          <div style="display:flex;gap:10px;align-items:flex-start;">
            <span style="color:#10b981;font-size:14px;margin-top:1px;">✓</span>
            <span style="color:#cbd5e1;font-size:14px;">Payments arrive in your wallet in seconds on Solana</span>
          </div>
        </div>
      </div>

      <a href="${inviteUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#7c3aed,#4338ca);color:white;font-size:15px;font-weight:600;text-decoration:none;padding:14px 24px;border-radius:10px;margin-bottom:20px;">
        Accept Invite &amp; Set Up Wallet →
      </a>

      <p style="color:#475569;font-size:12px;text-align:center;margin:0;">
        Or copy this link: <span style="color:#7c3aed;">${inviteUrl}</span>
      </p>
    </div>

    <p style="color:#334155;font-size:12px;text-align:center;margin-top:24px;">
      Protected by Arcium Confidential Compute · Powered by Solana<br/>
      If you weren't expecting this, you can safely ignore it.
    </p>
  </div>
</body>
</html>`,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Brevo API error ${res.status}`)
  }
}

export async function sendEmployerWelcomeEmail({
  employerName,
  employerEmail,
  companyName,
}: {
  employerName: string
  employerEmail: string
  companyName: string
}) {
  const dashboardUrl = `${APP_URL}/dashboard`

  const res = await fetch(BREVO_API, {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY!,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME || 'FlashPay Private',
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ name: employerName, email: employerEmail }],
      subject: `${companyName}'s payroll is live on FlashPay`,
      htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#0a0b0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 16px;">

    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:10px;">
        <img src="${APP_URL}/logo.png" alt="FlashPay" width="36" height="36" style="border-radius:10px;display:block;" />
        <span style="color:white;font-size:20px;font-weight:700;">FlashPay <span style="color:#a78bfa;">Private</span></span>
      </div>
    </div>

    <div style="background:#0f1117;border:1px solid rgba(100,116,139,0.3);border-radius:16px;padding:40px;">
      <h1 style="color:#f1f5f9;font-size:24px;font-weight:700;margin:0 0 8px;">Your payroll is ready 🚀</h1>
      <p style="color:#94a3b8;font-size:15px;margin:0 0 28px;line-height:1.6;">
        Hi <strong style="color:#e2e8f0;">${employerName}</strong>, your company payroll for
        <strong style="color:#c4b5fd;">${companyName}</strong> has been successfully created on FlashPay Private.
        You can now add employees and run confidential payroll on Solana.
      </p>

      <div style="background:rgba(149,255,221,0.06);border:1px solid rgba(149,255,221,0.15);border-radius:12px;padding:20px;margin-bottom:28px;">
        <p style="color:#94a3b8;font-size:13px;margin:0 0 12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">What you can do now</p>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div style="display:flex;gap:10px;align-items:flex-start;">
            <span style="color:#95ffdd;font-size:14px;margin-top:1px;">✓</span>
            <span style="color:#cbd5e1;font-size:14px;">Add employees and send them onboarding invites</span>
          </div>
          <div style="display:flex;gap:10px;align-items:flex-start;">
            <span style="color:#95ffdd;font-size:14px;margin-top:1px;">✓</span>
            <span style="color:#cbd5e1;font-size:14px;">Run bulk payroll — USDC settles in ~400ms on Solana</span>
          </div>
          <div style="display:flex;gap:10px;align-items:flex-start;">
            <span style="color:#95ffdd;font-size:14px;margin-top:1px;">✓</span>
            <span style="color:#cbd5e1;font-size:14px;">All salary data encrypted by Arcium — fully confidential</span>
          </div>
        </div>
      </div>

      <a href="${dashboardUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#6c44fc,#4338ca);color:white;font-size:15px;font-weight:600;text-decoration:none;padding:14px 24px;border-radius:10px;margin-bottom:20px;">
        Go to Your Dashboard →
      </a>

      <p style="color:#475569;font-size:12px;text-align:center;margin:0;">
        Logged in as <span style="color:#6c44fc;">${employerEmail}</span>
      </p>
    </div>

    <p style="color:#334155;font-size:12px;text-align:center;margin-top:24px;">
      Protected by Arcium Confidential Compute · Powered by Solana<br/>
      If you didn't create this account, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('Welcome email error:', err)
    // Don't throw — welcome email failure shouldn't block account creation
  }
}
