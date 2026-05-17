import { useState, useRef, useEffect, type ReactNode } from 'react'

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CONSTANTS & STYLES
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const STEPS = [
  { id: 'team', label: 'Team' },
  { id: 'spieler', label: 'Spieler' },
  { id: 'regelwerk', label: 'Regelwerk' },
  { id: 'absenden', label: 'Absenden' },
]

const PLAYER_COUNT = 8
const REQUIRED_PLAYER_COUNT = 4
// Altersregel für Spieler am Turniertag (30.05.2026): mindestens 16 Jahre, keine Obergrenze
const MIN_BIRTHDATE = '2010-05-30' // jünger als 16 wenn Geburtsdatum danach liegt

const BANK = {
  empfaenger: 'Muslimrat München e.V.',
  iban: 'DE92 5023 4500 0436 8100 01',
  betrag: '20,00 €',
}

type RequiredField = { name: string; label: string; stepIndex: number }

const REQUIRED_FIELDS: RequiredField[] = [
  { name: 'teamname', label: 'Teamname', stepIndex: 0 },
  { name: 'kapitaen_name', label: 'Kapitän — Vor- und Nachname', stepIndex: 0 },
  { name: 'kapitaen_telefon', label: 'Telefon Kapitän', stepIndex: 0 },
  { name: 'kapitaen_email', label: 'E-Mail Kapitän', stepIndex: 0 },
  { name: 'unterschrift_name', label: 'Vor- und Nachname (Unterschrift)', stepIndex: 3 },
]

const field =
  'w-full rounded-lg border border-mfe-border bg-white px-4 py-3.5 text-base text-mfe-text transition-all duration-200 placeholder:text-mfe-text-soft/50 min-h-[48px]'
const label = 'mb-1.5 block text-[13px] font-semibold tracking-wide text-mfe-text-soft uppercase'
const card = 'rounded-2xl border border-mfe-border bg-mfe-card p-5 sm:p-8 shadow-[0_2px_12px_rgba(28,19,53,0.04)]'

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COMPONENTS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-mfe-purple-soft"
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              width: i < current ? '100%' : i === current ? '50%' : '0%',
              background: i <= current
                ? 'linear-gradient(90deg, #9B6FE8, #E88BFF)'
                : 'transparent',
            }}
          />
        </div>
      ))}
    </div>
  )
}

function StepShell({
  children,
  visible,
}: {
  children: ReactNode
  visible: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (visible && ref.current) {
      requestAnimationFrame(() => {
        ref.current?.classList.remove('step-enter')
        ref.current?.classList.add('step-active')
      })
    }
  }, [visible])

  return (
    <div ref={ref} className={visible ? 'step-enter' : 'hidden'}>
      {children}
    </div>
  )
}

function Checkbox({
  name,
  checked,
  onChange,
  children,
}: {
  name: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  children: ReactNode
}) {
  return (
    <label className="flex gap-3 rounded-xl border border-mfe-border bg-mfe-surface p-4 cursor-pointer transition-all duration-200 hover:border-mfe-purple/30 hover:bg-mfe-purple-soft/30 has-[:checked]:border-mfe-purple/40 has-[:checked]:bg-mfe-purple-soft/40">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-0.5 h-[18px] w-[18px] shrink-0 rounded border-mfe-border"
      />
      <span className="text-[13px] leading-relaxed text-mfe-text-soft">{children}</span>
    </label>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN APP
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function App() {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [regelwerkChecked, setRegelwerkChecked] = useState(false)
  const [ueberweisungChecked, setUeberweisungChecked] = useState(false)
  const [missingFields, setMissingFields] = useState<RequiredField[]>([])
  const [ibanCopied, setIbanCopied] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const next = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  const back = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setStep((s) => Math.max(s - 1, 0))
  }

  const jumpToStep = (stepIndex: number) => {
    setStep(stepIndex)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const copyIban = () => {
    navigator.clipboard.writeText(BANK.iban.replace(/\s/g, '')).then(() => {
      setIbanCopied(true)
      setTimeout(() => setIbanCopied(false), 2000)
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = formRef.current
    if (!form) return
    const formData = new FormData(form)

    const missing: RequiredField[] = []

    REQUIRED_FIELDS.forEach((f) => {
      const v = formData.get(f.name)
      if (!v || (typeof v === 'string' && !v.trim())) {
        missing.push(f)
      }
    })

    // Spielerliste: Spieler 1–4 Pflicht, 5–8 optional (aber wenn ausgefüllt: vollständig + Alter ≥ 16)
    for (let i = 1; i <= PLAYER_COUNT; i++) {
      const nameRaw = formData.get(`spieler${i}_name`)
      const birthRaw = formData.get(`spieler${i}_geburtsdatum`)
      const name = typeof nameRaw === 'string' ? nameRaw.trim() : ''
      const birth = typeof birthRaw === 'string' ? birthRaw.trim() : ''
      const isRequired = i <= REQUIRED_PLAYER_COUNT
      const hasAnyInput = name !== '' || birth !== ''

      if (isRequired || hasAnyInput) {
        if (!name) {
          missing.push({ name: `spieler${i}_name`, label: `Spieler ${i} — Name`, stepIndex: 1 })
        }
        if (!birth) {
          missing.push({ name: `spieler${i}_geburtsdatum`, label: `Spieler ${i} — Geburtsdatum`, stepIndex: 1 })
        } else if (birth > MIN_BIRTHDATE) {
          missing.push({
            name: `spieler${i}_geburtsdatum`,
            label: `Spieler ${i} — unter 16 Jahre alt (nicht erlaubt)`,
            stepIndex: 1,
          })
        }
      }
    }

    if (!regelwerkChecked) {
      missing.push({ name: 'regelwerk_bestaetigt', label: 'Regelwerk akzeptieren', stepIndex: 2 })
    }

    if (!ueberweisungChecked) {
      missing.push({ name: 'ueberweisung_bestaetigt', label: 'Überweisung der Anmeldegebühr bestätigen', stepIndex: 3 })
    }

    if (!formData.get('digitale_bestaetigung')) {
      missing.push({ name: 'digitale_bestaetigung', label: 'Bestätigung der Angaben (Checkbox)', stepIndex: 3 })
    }

    if (missing.length > 0) {
      setMissingFields(missing)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setMissingFields([])

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
    })
      .then(() => setSubmitted(true))
      .catch(() => setSubmitted(true))
  }

  /* ━━━ SUCCESS STATE ━━━ */
  if (submitted) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-12">
        <div className={card + ' w-full text-center'}>
          <img src="/logo-mfe26.png" alt="München feiert Eid '26" className="mx-auto h-24 w-auto" />
          <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-mfe-success/10">
            <svg className="h-7 w-7 text-mfe-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-bold text-mfe-text">Anmeldung eingegangen!</h2>
          <p className="mt-2 text-sm text-mfe-text-soft leading-relaxed">
            Wir bestätigen die Anmeldung deines Teams, sobald die <strong className="text-mfe-text">Anmeldegebühr von 20&nbsp;€</strong> auf
            unserem Konto eingegangen ist.
          </p>
          <div className="mt-6 rounded-xl bg-mfe-gold-warm p-4 text-left">
            <p className="text-[13px] font-bold text-mfe-text">Nächste Schritte:</p>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-[13px] text-mfe-text-soft">
              <li>Anmeldegebühr 20&nbsp;€ überweisen (falls noch nicht erfolgt)</li>
              <li>Bestätigung per E-Mail abwarten</li>
              <li>Spielplan kommt kurz vor dem Turniertag</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  /* ━━━ FORM ━━━ */
  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 pb-12 pt-8 sm:pt-12">
      {/* ━━━ HEADER ━━━ */}
      <div className="mb-8 text-center">
        <img
          src="/logo-mfe26.png"
          alt="München feiert Eid '26"
          className="mx-auto h-28 w-auto sm:h-36"
        />
        <p className="mt-4 text-[13px] font-semibold uppercase tracking-[0.15em] text-mfe-purple">
          MFE Cup 2026 · Anmeldung
        </p>
        <p className="mt-1 text-sm text-mfe-text-soft">
          4v4 Fußballturnier · 30. & 31. Mai 2026 · ab 14:00 Uhr · Riemer Park
        </p>
      </div>

      {/* ━━━ PROGRESS ━━━ */}
      <div className="mb-2">
        <ProgressBar current={step} total={STEPS.length} />
      </div>
      <div className="mb-6 flex items-center justify-between text-[12px] text-mfe-text-soft">
        <span>Schritt {step + 1} von {STEPS.length}</span>
        <span className="text-sm font-bold text-mfe-purple">{STEPS[step].label}</span>
      </div>

      {/* ━━━ DEADLINE & LIMIT ━━━ */}
      {step === 0 && (
        <div className="mb-6 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-mfe-purple-soft/40 px-4 py-3 text-center">
            <p className="text-[11px] uppercase tracking-wide text-mfe-text-soft">Anmeldeschluss</p>
            <p className="text-[14px] font-bold text-mfe-text">27. Mai 2026</p>
          </div>
          <div className="rounded-xl bg-mfe-gold-warm px-4 py-3 text-center">
            <p className="text-[11px] uppercase tracking-wide text-mfe-text-soft">Maximal</p>
            <p className="text-[14px] font-bold text-mfe-text">16 Teams · 20 € / Team</p>
          </div>
        </div>
      )}

      {/* ━━━ ERROR BOX ━━━ */}
      {missingFields.length > 0 && (
        <div className="mb-6 rounded-xl border-2 border-mfe-error/40 bg-mfe-error/5 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              <svg className="h-5 w-5 text-mfe-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-mfe-error">
                Bitte fülle noch {missingFields.length === 1 ? 'dieses Feld' : `diese ${missingFields.length} Felder`} aus:
              </p>
              <ul className="mt-2 space-y-1.5">
                {missingFields.map((f) => (
                  <li key={f.name} className="flex items-center justify-between gap-3 text-[13px]">
                    <span className="text-mfe-text">
                      <span className="text-mfe-error mr-1">•</span>
                      {f.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => jumpToStep(f.stepIndex)}
                      className="shrink-0 rounded-md bg-mfe-error/10 px-2.5 py-1 text-[11px] font-semibold text-mfe-error transition-colors hover:bg-mfe-error/20 cursor-pointer"
                    >
                      → Schritt {f.stepIndex + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ━━━ FORM ━━━ */}
      <form
        ref={formRef}
        name="cup-anmeldung"
        method="POST"
        data-netlify="true"
        netlify-honeypot="bot-field"
        onSubmit={handleSubmit}
        noValidate
      >
        <input type="hidden" name="form-name" value="cup-anmeldung" />
        <p className="hidden"><input name="bot-field" /></p>

        {/* ━━━ STEP 1: TEAM & KAPITÄN ━━━ */}
        <StepShell visible={step === 0}>
          <div className={card}>
            <h2 className="text-lg font-bold text-mfe-text">Team & Kapitän</h2>
            <p className="mt-1 text-sm text-mfe-text-soft">Wer meldet das Team an? Der Kapitän ist unser Ansprechpartner bis zum Turniertag.</p>

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="teamname" className={label}>Teamname</label>
                <input id="teamname" name="teamname" type="text" required className={field} placeholder="z.B. FC Eid Stars" />
              </div>
              <div>
                <label htmlFor="kapitaen_name" className={label}>Kapitän — Vor- und Nachname</label>
                <input id="kapitaen_name" name="kapitaen_name" type="text" required className={field} />
              </div>
              <div>
                <label htmlFor="kapitaen_telefon" className={label}>Telefon Kapitän</label>
                <input id="kapitaen_telefon" name="kapitaen_telefon" type="tel" required className={field} placeholder="+49 176 ..." />
              </div>
              <div>
                <label htmlFor="kapitaen_email" className={label}>E-Mail Kapitän</label>
                <input id="kapitaen_email" name="kapitaen_email" type="email" required className={field} placeholder="kapitaen@email.de" />
              </div>
            </div>
          </div>
        </StepShell>

        {/* ━━━ STEP 2: SPIELERLISTE ━━━ */}
        <StepShell visible={step === 1}>
          <div className={card}>
            <h2 className="text-lg font-bold text-mfe-text">Spielerliste</h2>
            <p className="mt-1 text-sm text-mfe-text-soft">
              Mindestens <strong className="text-mfe-text">4 Spieler</strong> (3 Feldspieler + 1 Torwart) sind Pflicht.
              Bis zu <strong className="text-mfe-text">4 weitere Auswechselspieler</strong> können optional ergänzt werden.
              Alle Spieler müssen am Turniertag <strong className="text-mfe-text">mindestens 16 Jahre</strong> alt sein (keine Obergrenze).
            </p>

            <div className="mt-6 space-y-3">
              {Array.from({ length: PLAYER_COUNT }).map((_, idx) => {
                const n = idx + 1
                const required = n <= REQUIRED_PLAYER_COUNT
                return (
                  <div key={n} className="rounded-xl border border-mfe-border bg-mfe-surface p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[12px] font-semibold uppercase tracking-wide text-mfe-text-soft">
                        Spieler {n}{n === 1 ? ' (Kapitän)' : ''}
                      </p>
                      <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${required ? 'bg-mfe-purple-soft text-mfe-purple' : 'bg-mfe-gold-warm text-mfe-text-soft'}`}>
                        {required ? 'Pflicht' : 'Optional'}
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                      <input
                        name={`spieler${n}_name`}
                        type="text"
                        required={required}
                        className={field}
                        placeholder="Vor- und Nachname"
                      />
                      <input
                        name={`spieler${n}_geburtsdatum`}
                        type="date"
                        required={required}
                        max={MIN_BIRTHDATE}
                        className={field}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </StepShell>

        {/* ━━━ STEP 3: REGELWERK ━━━ */}
        <StepShell visible={step === 2}>
          <div className={card}>
            <h2 className="text-lg font-bold text-mfe-text">Regelwerk MFE Cup 2026</h2>
            <p className="mt-1 text-sm text-mfe-text-soft">Bitte lies das Regelwerk und akzeptiere es am Ende.</p>

            <div className="mt-6 space-y-4 text-[13px] leading-relaxed text-mfe-text-soft">

              <div className="rounded-xl bg-mfe-surface p-4 space-y-2.5">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-mfe-purple">1. Allgemeines</p>
                <ul className="space-y-2 list-disc pl-4">
                  <li>Gespielt wird im Format <strong className="text-mfe-text">4 gegen 4</strong> (3 Feldspieler + 1 Torwart).</li>
                  <li>Pro Team sind <strong className="text-mfe-text">mindestens 4 und maximal 8 Spieler</strong> erlaubt.</li>
                  <li>Spieler müssen <strong className="text-mfe-text">mindestens 16 Jahre</strong> alt sein (keine Obergrenze).</li>
                  <li>Turniermodus und Spielplan werden am Turniertag bekannt gegeben.</li>
                </ul>
              </div>

              <div className="rounded-xl bg-mfe-surface p-4 space-y-2.5">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-mfe-purple">2. Spielzeit</p>
                <ul className="space-y-2 list-disc pl-4">
                  <li>Spiele dauern <strong className="text-mfe-text">7 Minuten</strong>.</li>
                  <li>Das Finale dauert <strong className="text-mfe-text">10 Minuten</strong>.</li>
                </ul>
              </div>

              <div className="rounded-xl bg-mfe-surface p-4 space-y-2.5">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-mfe-purple">3. Spielleitung</p>
                <ul className="space-y-2 list-disc pl-4">
                  <li>Es gibt <strong className="text-mfe-text">keine Schiedsrichter</strong>, sondern Spielbeobachter.</li>
                  <li>Bei strittigen Situationen können diese einberufen werden — ihre Entscheidung ist <strong className="text-mfe-text">endgültig</strong>.</li>
                </ul>
              </div>

              <div className="rounded-xl bg-mfe-surface p-4 space-y-2.5">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-mfe-purple">4. Fair Play & Respekt</p>
                <p>Das Turnier steht für ein <strong className="text-mfe-text">respektvolles und brüderliches Miteinander</strong>. Das bedeutet:</p>
                <ul className="space-y-2 list-disc pl-4">
                  <li>Respekt gegenüber allen Spielern und Teams</li>
                  <li>Keine Beleidigungen oder Provokationen</li>
                  <li>Ehrlichkeit bei Fouls und Entscheidungen</li>
                  <li>Akzeptanz von Entscheidungen</li>
                  <li>Rücksicht auf die Gesundheit aller Spieler</li>
                </ul>
                <p>Unsportliches Verhalten widerspricht dem Geist des Turniers.</p>
              </div>

              <div className="rounded-xl bg-mfe-surface p-4 space-y-2.5">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-mfe-purple">5. Fouls & Konsequenzen</p>
                <ul className="space-y-2 list-disc pl-4">
                  <li>Unsportliches Verhalten kann zu <strong className="text-mfe-text">Ballverlust</strong> führen.</li>
                  <li>Wiederholte Verstöße → <strong className="text-mfe-text">Ausschluss eines Spielers</strong>.</li>
                  <li>Schwere Verstöße → <strong className="text-mfe-text">Ausschluss des Teams</strong>.</li>
                </ul>
              </div>

              <div className="rounded-xl bg-mfe-surface p-4 space-y-2.5">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-mfe-purple">6. Teilnahme</p>
                <ul className="space-y-2 list-disc pl-4">
                  <li>Teilnahme nur mit <strong className="text-mfe-text">bezahlter Anmeldegebühr</strong> (20 €).</li>
                  <li>Die Anmeldung ist <strong className="text-mfe-text">verbindlich</strong>.</li>
                </ul>
              </div>

              <div className="rounded-xl bg-mfe-surface p-4 space-y-2.5">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-mfe-purple">7. Sonstiges</p>
                <ul className="space-y-2 list-disc pl-4">
                  <li>Die Turnierleitung behält sich Änderungen vor.</li>
                  <li>Mit Teilnahme werden alle Regeln akzeptiert.</li>
                </ul>
              </div>

              <Checkbox
                name="regelwerk_bestaetigt"
                checked={regelwerkChecked}
                onChange={setRegelwerkChecked}
              >
                <strong className="text-mfe-text">Wir akzeptieren das Regelwerk</strong> und bestätigen, dass alle Spieler unseres Teams die Regeln kennen und einhalten.
              </Checkbox>
            </div>
          </div>
        </StepShell>

        {/* ━━━ STEP 4: ABSENDEN ━━━ */}
        <StepShell visible={step === 3}>
          <div className={card}>
            <h2 className="text-lg font-bold text-mfe-text">Anmeldegebühr & Absenden</h2>
            <p className="mt-1 text-sm text-mfe-text-soft">Die Anmeldung wird gültig, sobald die Anmeldegebühr eingegangen ist.</p>

            <div className="mt-6 space-y-4">
              {/* Bankdaten */}
              <div className="rounded-xl border border-mfe-purple/30 bg-mfe-purple-soft/30 p-4 sm:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-mfe-purple">Bankverbindung</p>
                <div className="mt-3 space-y-2.5 text-[14px]">
                  <div className="flex justify-between gap-3">
                    <span className="text-mfe-text-soft">Empfänger</span>
                    <span className="font-semibold text-mfe-text text-right">{BANK.empfaenger}</span>
                  </div>
                  <div className="flex justify-between gap-3 items-center">
                    <span className="text-mfe-text-soft">IBAN</span>
                    <button
                      type="button"
                      onClick={copyIban}
                      className="font-mono text-[13px] font-semibold text-mfe-text bg-white rounded-md px-2 py-1 hover:bg-mfe-purple/10 transition-colors cursor-pointer"
                      title="IBAN kopieren"
                    >
                      {ibanCopied ? '✓ Kopiert' : BANK.iban}
                    </button>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-mfe-text-soft">Verwendungszweck</span>
                    <span className="font-semibold text-mfe-text text-right">MFE Cup 2026 — [Teamname]</span>
                  </div>
                  <div className="flex justify-between gap-3 pt-2 border-t border-mfe-purple/20">
                    <span className="text-mfe-text-soft">Betrag</span>
                    <span className="text-lg font-bold text-mfe-purple">{BANK.betrag}</span>
                  </div>
                </div>
              </div>

              <Checkbox
                name="ueberweisung_bestaetigt"
                checked={ueberweisungChecked}
                onChange={setUeberweisungChecked}
              >
                Ich bestätige, dass die <strong className="text-mfe-text">Anmeldegebühr von 20&nbsp;€</strong> überwiesen wurde oder unverzüglich überwiesen wird. Mir ist bekannt, dass die Anmeldung erst mit Zahlungseingang gültig ist.
              </Checkbox>

              <div>
                <label htmlFor="unterschrift_name" className={label}>Unterschrift Kapitän — Vor- und Nachname</label>
                <input id="unterschrift_name" name="unterschrift_name" type="text" required className={field} />
              </div>

              <Checkbox name="digitale_bestaetigung">
                Ich bestätige die <strong className="text-mfe-text">Richtigkeit aller Angaben</strong> und melde unser Team verbindlich zum MFE Cup 2026 an.
              </Checkbox>
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-xl py-4 text-[15px] font-bold text-white shadow-lg transition-all duration-300 active:scale-[0.98] cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #9B6FE8 0%, #E88BFF 100%)',
                boxShadow: '0 4px 20px rgba(155, 111, 232, 0.3)',
              }}
            >
              Anmeldung absenden
            </button>
          </div>
        </StepShell>

        {/* ━━━ NAVIGATION ━━━ */}
        <div className="sticky bottom-0 left-0 right-0 mt-6 -mx-4 border-t border-mfe-border/50 bg-white/90 px-4 py-3 backdrop-blur-lg sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
          <div className="flex items-center justify-between">
            {step > 0 ? (
              <button
                type="button"
                onClick={back}
                className="flex items-center gap-1.5 rounded-xl px-5 py-3 text-sm font-semibold text-mfe-text-soft transition-colors hover:text-mfe-text hover:bg-mfe-purple-soft/30 active:scale-[0.97] cursor-pointer min-h-[48px]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Zurück
              </button>
            ) : (
              <div />
            )}

            {step < STEPS.length - 1 && (() => {
              const nextDisabled = step === 2 && !regelwerkChecked
              return (
                <button
                  type="button"
                  onClick={next}
                  disabled={nextDisabled}
                  className="flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold text-white transition-all duration-300 active:scale-[0.97] cursor-pointer min-h-[48px] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                  style={{
                    background: 'linear-gradient(135deg, #9B6FE8 0%, #E88BFF 100%)',
                    boxShadow: nextDisabled ? 'none' : '0 2px 12px rgba(155, 111, 232, 0.25)',
                  }}
                >
                  Weiter
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )
            })()}
          </div>
        </div>
      </form>

      {/* ━━━ FOOTER ━━━ */}
      <div className="mt-10 text-center text-[11px] text-mfe-text-soft/50">
        <p>Veranstalter: Muslimrat München e.V. · MuC e.V. (MuslimsConnect)</p>
        <p className="mt-0.5">Bei Fragen: events@muc-connect.de</p>
      </div>
    </div>
  )
}
