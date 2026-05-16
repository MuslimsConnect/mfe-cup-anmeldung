export default async (req) => {
  try {
    const { payload } = await req.json()
    const data = payload.data

    const teamname = data.teamname || '—'
    const kapitaen = data.kapitaen_name || '—'
    const telefon = data.kapitaen_telefon || '—'
    const email = data.kapitaen_email || '—'

    const spielerRows = []
    for (let i = 1; i <= 8; i++) {
      const name = data[`spieler${i}_name`] || '—'
      const birth = data[`spieler${i}_geburtsdatum`] || '—'
      const birthFmt = birth !== '—' ? new Date(birth).toLocaleDateString('de-DE') : '—'
      spielerRows.push(`
        <tr>
          <td style="padding: 6px 0; color: #6B6280; width: 60px;">${i}.${i === 1 ? ' (K)' : ''}</td>
          <td style="padding: 6px 0; font-weight: 600;">${name}</td>
          <td style="padding: 6px 0; color: #6B6280; text-align: right;">${birthFmt}</td>
        </tr>
      `)
    }

    const ueberweisung = data.ueberweisung_bestaetigt ? '✅ Bestätigt' : '⚠️ Nicht bestätigt'
    const regelwerk = data.regelwerk_bestaetigt ? '✅ Akzeptiert' : '⚠️ Nicht bestätigt'
    const unterschrift = data.unterschrift_name || '—'

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1C1335; background: #FAFAFE;">

  <div style="text-align: center; padding: 24px 0;">
    <h1 style="font-size: 20px; color: #9B6FE8; margin: 0;">Neue MFE Cup Anmeldung</h1>
    <p style="font-size: 14px; color: #6B6280; margin: 8px 0 0;">München feiert Eid '26 · 4v4 Fußballturnier</p>
  </div>

  <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #E8E4F0;">

    <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #9B6FE8; margin: 0 0 16px;">Team & Kapitän</h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr>
        <td style="padding: 8px 0; color: #6B6280; width: 140px;">Teamname</td>
        <td style="padding: 8px 0; font-weight: 600;">${teamname}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6B6280;">Kapitän</td>
        <td style="padding: 8px 0;">${kapitaen}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6B6280;">Telefon</td>
        <td style="padding: 8px 0;"><a href="tel:${telefon}" style="color: #9B6FE8; text-decoration: none;">${telefon}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6B6280;">E-Mail</td>
        <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #9B6FE8; text-decoration: none;">${email}</a></td>
      </tr>
    </table>

    <hr style="border: none; border-top: 1px solid #E8E4F0; margin: 20px 0;">

    <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #9B6FE8; margin: 0 0 16px;">Spielerliste (8)</h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      ${spielerRows.join('')}
    </table>

    <hr style="border: none; border-top: 1px solid #E8E4F0; margin: 20px 0;">

    <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #9B6FE8; margin: 0 0 16px;">Anmeldegebühr & Bestätigungen</h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr>
        <td style="padding: 8px 0; color: #6B6280; width: 200px;">Anmeldegebühr 20&nbsp;€</td>
        <td style="padding: 8px 0; font-weight: 600;">${ueberweisung}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6B6280;">Regelwerk</td>
        <td style="padding: 8px 0;">${regelwerk}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6B6280;">Digital signiert von</td>
        <td style="padding: 8px 0; font-weight: 600;">${unterschrift}</td>
      </tr>
    </table>
  </div>

  <div style="text-align: center; padding: 20px 0; font-size: 12px; color: #6B6280;">
    <p>Eingegangen am ${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
    <p style="margin-top: 4px;">Nächster Schritt: Zahlungseingang prüfen und Anmeldung bestätigen.</p>
  </div>

</body>
</html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'München feiert Eid <noreply@muslimsconnect.de>',
        to: ['events@muc-connect.de'],
        subject: `Neue MFE Cup Anmeldung: ${teamname}`,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend error:', err)
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Function error:', error)
    return new Response('Error', { status: 500 })
  }
}
