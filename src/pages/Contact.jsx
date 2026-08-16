import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Reveal from '../components/ui/Reveal'
import SocialIcon, { socialNames } from '../components/ui/SocialIcon'
import { createInquiry } from '../api/inquiries'
import { images } from '../data/images'

const headerImage = images.pages.contact

const contactDetails = [
  {
    icon: MapPin,
    label: 'Find us',
    lines: ['No 52, Handy Nanayakkara Mawatha Ankokkawala, Galle 80048 Sri Lanka'],
    href: 'https://maps.app.goo.gl/H1mrskAXV2ktWj369',
  },
  {
    icon: Phone,
    label: 'Call us',
    lines: ['+94 91 234 5678', '+94 77 123 4567'],
    href: 'tel:+94912345678',
  },
  {
    icon: Mail,
    label: 'Email us',
    lines: ['stay@orendagalle.com', 'press@orendagalle.com'],
    href: 'mailto:stay@orendagalle.com',
  },
  {
    icon: Clock,
    label: 'Reception',
    lines: ['Daily · 7:00 AM – 10:00 PM', 'Concierge on call 24/7'],
  },
]

const initialForm = {
  name: '',
  email: '',
  phone: '',
  checkIn: '',
  checkOut: '',
  guests: '2',
  message: '',
}

export default function Contact() {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await createInquiry({
        full_name: form.name,
        email: form.email,
        phone: form.phone,
        guests: form.guests === '8+' ? 8 : Number(form.guests),
        check_in: form.checkIn || null,
        check_out: form.checkOut || null,
        message: form.message,
      })
      setSubmitted(true)
    } catch (err) {
      toast.error(err.message || 'Could not send your enquiry — please try again.')
    } finally {
      setSending(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-moss-900 placeholder:text-moss-800/40 transition-colors duration-300 focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/20'

  return (
    <>
      <PageHeader
        title="Contact Us"
        subtitle="Send us your dates, a question, or simply a hello — we usually reply within a few hours."
        image={headerImage}
      />

      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <div className="rounded-3xl bg-white p-6 ring-1 ring-sand-200 sm:p-10">
              <h2 className="font-serif text-3xl text-moss-900">Send an enquiry</h2>
              <p className="mt-2 text-sm text-moss-800/60">
                No payment or commitment needed — we'll simply hold your dates.
              </p>

              {submitted ? (
                <div className="mt-10 rounded-2xl bg-moss-50 p-8 text-center ring-1 ring-moss-100">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-moss-600 text-sand-50">
                    <Send size={22} />
                  </span>
                  <h3 className="mt-5 font-serif text-2xl text-moss-900">
                    Thank you, {form.name || 'friend'}!
                  </h3>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-moss-800/70">
                    Your enquiry is on its way. Our team will get back to you at{' '}
                    <span className="font-medium text-moss-900">{form.email}</span>{' '}
                    within a few hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(initialForm)
                      setSubmitted(false)
                    }}
                    className="mt-6 text-sm font-medium uppercase tracking-wide text-brass-600 transition-colors hover:text-brass-500"
                  >
                    Send another enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-moss-800/70">
                      Full name
                    </span>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Amara Silva"
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-moss-800/70">
                      Email
                    </span>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-moss-800/70">
                      Phone (optional)
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+94 ..."
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-moss-800/70">
                      Guests
                    </span>
                    <select
                      name="guests"
                      value={form.guests}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      {['1', '2', '3', '4', '5', '6', '7', '8+'].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === '1' ? 'guest' : 'guests'}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-moss-800/70">
                      Check-in
                    </span>
                    <input
                      type="date"
                      name="checkIn"
                      value={form.checkIn}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-moss-800/70">
                      Check-out
                    </span>
                    <input
                      type="date"
                      name="checkOut"
                      value={form.checkOut}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-moss-800/70">
                      Message
                    </span>
                    <textarea
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us about your dream stay..."
                      className={inputClass}
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={sending}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brass-500 px-8 py-3.5 text-sm font-medium uppercase tracking-wide text-white transition-all duration-300 hover:bg-brass-600 hover:shadow-lg hover:shadow-brass-500/30 disabled:opacity-60 sm:w-auto"
                    >
                      {sending ? 'Sending…' : 'Send Enquiry'}
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-2">
            <div className="flex h-full flex-col gap-6">
              <div className="space-y-6 rounded-3xl bg-forest-950 p-6 text-sand-100 sm:p-8">
                {contactDetails.map(({ icon: Icon, label, lines, href }) => (
                  <div key={label} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-moss-800 text-brass-400">
                      <Icon size={19} strokeWidth={1.75} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-400">
                        {label}
                      </p>
                      {lines.map((line) =>
                        href ? (
                          <a
                            key={line}
                            href={href}
                            className="block text-sm text-sand-100/85 transition-colors hover:text-brass-300"
                          >
                            {line}
                          </a>
                        ) : (
                          <p key={line} className="text-sm text-sand-100/85">
                            {line}
                          </p>
                        ),
                      )}
                    </div>
                  </div>
                ))}

                <div className="border-t border-sand-200/10 pt-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-400">
                    Follow along
                  </p>
                  <div className="mt-4 flex gap-3">
                    {socialNames.map((name) => (
                      <a
                        key={name}
                        href="#"
                        aria-label={name}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-sand-200/20 text-sand-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-brass-400 hover:text-brass-400"
                      >
                        <SocialIcon name={name} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-hidden rounded-3xl ring-1 ring-sand-200">
                <iframe
                  title="Orenda Galle location — Google Maps"
                  src="https://www.google.com/maps?q=orenda%20eco%20lodge%20%26%20spa&output=embed"
                  className="h-full min-h-[280px] w-full border-0 sm:min-h-[320px]"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
