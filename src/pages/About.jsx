import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  ArrowDown,
  Phone,
  Mail,
  MapPin,
  Send,
  Users,
  CalendarDays,
  ExternalLink,
} from 'lucide-react'
import Button from '../components/ui/Button'
import SectionHeading from '../components/ui/SectionHeading'
import Reveal from '../components/ui/Reveal'
import RoomCard from '../components/ui/RoomCard'
import TestimonialCard from '../components/ui/TestimonialCard'
import OfferCard from '../components/ui/OfferCard'
import Loading from '../components/ui/Loading'
import ErrorMessage from '../components/ui/ErrorMessage'
import SocialIcon, { socialNames } from '../components/ui/SocialIcon'
import { amenities } from '../data/amenities'
import { images, localFlyers } from '../data/images'
import { useApi } from '../hooks/useApi'
import { listVillas } from '../api/villas'
import { listTestimonials } from '../api/testimonials'
import { listGallery } from '../api/gallery'
import { listActiveOffers } from '../api/offers'
import { getPublicSettings } from '../api/settings'
import { createInquiry } from '../api/inquiries'

export default function About() {
  const rooms = useApi(listVillas)
  const testimonials = useApi(listTestimonials)
  const gallery = useApi(listGallery)
  const offers = useApi(listActiveOffers)
  const settings = useApi(getPublicSettings)
  const [inquiryRoom, setInquiryRoom] = useState('')
  const contactRef = useRef(null)

  const handleInquire = (room) => {
    setInquiryRoom(room ? String(room.id) : '')
    contactRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const resortName = settings.data?.resort_name || 'Orenda Eco lodge and Spa'

  return (
    <>
      <Hero name={resortName} tagline={settings.data?.resort_tagline || 'Luxury Eco Resort'} />
      <AboutIntro />
      <NatureVillage />
      <Rooms data={rooms} onInquire={handleInquire} />
      <Amenities />
      <Gallery data={gallery} />
      <Offers data={offers} />
      <Testimonials data={testimonials} />
      <Contact
        settings={settings.data}
        rooms={rooms.data}
        selectedRoom={inquiryRoom}
        onRoomChange={setInquiryRoom}
        contactRef={contactRef}
      />
    </>
  )
}

function Hero({ name, tagline }) {
  return (
    <section id="home" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={images.hero}
          alt="Sunset over the resort pool"
          decoding="async"
          className="h-full w-full animate-ken-burns object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/60 via-forest-950/30 to-forest-950/80" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl px-5 py-24 text-center text-sand-50 sm:py-32">
        <p className="animate-fade-up text-[11px] font-semibold uppercase tracking-[0.35em] text-brass-300 sm:text-xs">
          Luxury Eco Resort · Galle, Sri Lanka
        </p>
        <h1 className="mt-6 animate-fade-up font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
          {name}
        </h1>
        <p className="mt-6 animate-fade-up text-lg font-light uppercase tracking-[0.25em] text-brass-300 sm:text-xl">
          {tagline}
        </p>
        <p className="mx-auto mt-8 max-w-xl animate-fade-up text-base leading-relaxed text-sand-100/90 sm:text-lg">
          Comfortable rooms tucked between the mangroves and the Indian Ocean —
          built from timber, powered by the sun, and tuned to the rhythm of the tide.
        </p>
        <div className="mt-10 flex animate-fade-up flex-wrap items-center justify-center gap-4">
          <Button href="#contact" variant="light" size="lg">
            Book Now
          </Button>
          <Button href="#rooms" variant="ghost" size="lg">
            Explore the Rooms
          </Button>
        </div>
      </div>

      <a
        href="#about"
        aria-label="Scroll to explore"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce text-sand-100/80 transition-colors hover:text-brass-300"
      >
        <ArrowDown size={22} />
      </a>
    </section>
  )
}

function AboutIntro() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
        <Reveal>
          <div className="relative">
            <img
              src={images.welcome}
              alt="The resort gardens at dusk"
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] w-full rounded-3xl object-cover shadow-2xl shadow-moss-900/20"
            />
            <img
              src={images.about.village}
              alt="Village life around the resort"
              loading="lazy"
              decoding="async"
              className="absolute -bottom-10 -right-4 hidden w-1/2 rounded-2xl border-4 border-sand-50 object-cover shadow-xl sm:block lg:-right-8 lg:w-3/5"
            />
            <div className="absolute -bottom-6 -left-4 hidden rounded-2xl bg-moss-700 px-8 py-6 text-sand-50 shadow-xl sm:block lg:-left-8">
              <p className="font-serif text-5xl font-semibold">Est.</p>
              <p className="text-xs uppercase tracking-[0.25em] text-brass-300">2022 · Galle</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <SectionHeading
            align="left"
            eyebrow="What is Orenda?"
            title="A village property surrounded by nature"
          />
          <p className="mt-6 leading-relaxed text-moss-800/75">
            Orenda is a villa-type resort in Galle, Sri Lanka — a peaceful, village property
            set among native gardens and mangroves. We opened our doors in 2022, and our
            first guests have been returning ever since.
          </p>
          <p className="mt-4 leading-relaxed text-moss-800/75">
            Expect comfortable rooms, open-air living and cool ocean breezes — with the
            quiet company of birdsong. Above all, our small team is devoted to a personal
            experience, from your first hello to the last sunset.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="#rooms">Explore the Rooms</Button>
            <Button href="#contact" variant="outline">
              Plan Your Stay
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function NatureVillage() {
  return (
    <section className="bg-forest-950 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
        <Reveal>
          <SectionHeading
            dark
            align="left"
            eyebrow="Nature & Village"
            title="Slow mornings, wild gardens"
            description="Stay surrounded by the gardens, mangroves and the gentle rhythm of village life. Birdsong in the morning, ocean air in the evening, and nothing to hurry."
          />
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-moss-800/60 p-5 text-center ring-1 ring-sand-200/10">
              <p className="font-serif text-3xl font-semibold text-brass-300">2</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-sand-200/70">Acres of gardens</p>
            </div>
            <div className="rounded-2xl bg-moss-800/60 p-5 text-center ring-1 ring-sand-200/10">
              <p className="font-serif text-3xl font-semibold text-brass-300">3</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-sand-200/70">Comfortable rooms</p>
            </div>
            <div className="rounded-2xl bg-moss-800/60 p-5 text-center ring-1 ring-sand-200/10">
              <p className="font-serif text-3xl font-semibold text-brass-300">2022</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-sand-200/70">Established</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="grid grid-cols-2 gap-4">
            <img
              src={images.nature[4]}
              alt="Native gardens around the resort"
              loading="lazy"
              decoding="async"
              className="aspect-[3/4] w-full rounded-3xl object-cover shadow-xl"
            />
            <img
              src={images.nature[5]}
              alt="Mangroves and the south coast"
              loading="lazy"
              decoding="async"
              className="mt-12 aspect-[3/4] w-full rounded-3xl object-cover shadow-xl"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Rooms({ data, onInquire }) {
  const { data: items, loading, error, refetch } = data
  return (
    <section id="rooms" className="bg-moss-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Stay with us"
            title="Simple, comfortable rooms"
            description="Each room is private, comfortable and set within the gardens — rooms start from just $20, and every stay comes with the same warm welcome."
          />
        </Reveal>
        {error ? (
          <div className="mt-14">
            <ErrorMessage error={error} onRetry={refetch} />
          </div>
        ) : loading && !items ? (
          <div className="mt-14">
            <Loading />
          </div>
        ) : (
          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {(items || []).map((room, i) => (
              <Reveal key={room.id} delay={i * 120}>
                <RoomCard room={room} onInquire={onInquire} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function Amenities() {
  return (
    <section id="amenities" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Amenities"
            title="Everything you need, nothing you don't"
            description="Comfort crafted with care — every amenity designed to disappear into the landscape."
          />
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {amenities.map(({ icon: Icon, title, description }, i) => (
            <Reveal key={title} delay={(i % 5) * 80}>
              <div className="group h-full rounded-2xl border border-sand-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-moss-300 hover:shadow-xl hover:shadow-moss-900/10">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-moss-100 text-moss-600 transition-all duration-300 group-hover:bg-moss-500 group-hover:text-white">
                  <Icon size={22} strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 font-serif text-xl font-semibold text-moss-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-moss-800/65">{description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Gallery({ data }) {
  const { data: items, loading, error, refetch } = data
  return (
    <section id="gallery" className="bg-forest-950 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            dark
            eyebrow="Gallery"
            title="Glimpses of the south coast"
            description="A few quiet moments captured around the resort and its shoreline."
          />
        </Reveal>
        {error ? (
          <div className="mt-14">
            <ErrorMessage error={error} onRetry={refetch} />
          </div>
        ) : loading && !items ? (
          <div className="mt-14">
            <Loading />
          </div>
        ) : (
          <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {(items || []).map((image, i) => (
              <Reveal key={image.id} delay={(i % 4) * 80}>
                <div className="group relative overflow-hidden rounded-2xl">
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    decoding="async"
                    className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-forest-950/70 to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <p className="text-sm italic text-sand-100">{image.alt}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function Offers({ data }) {
  const { data: apiItems } = data
  const items = (apiItems && apiItems.length > 0) ? apiItems : localFlyers

  return (
    <section id="offers" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Offers & Promotions"
            title="Thoughtfully crafted escapes"
            description="Current packages and promotional flyers from the resort — from day outings to long slow stays."
          />
        </Reveal>

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((offer, i) => (
            <Reveal key={offer.id || i} delay={(i % 3) * 120}>
              <OfferCard offer={offer} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials({ data }) {
  const { data: items, loading, error, refetch } = data
  return (
    <section className="bg-moss-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading eyebrow="Testimonials" title="Words for our guests" />
        </Reveal>
        {error ? (
          <div className="mt-14">
            <ErrorMessage error={error} onRetry={refetch} />
          </div>
        ) : loading && !items ? (
          <div className="mt-14">
            <Loading />
          </div>
        ) : (
          <>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(items || []).map((testimonial, i) => (
                <Reveal key={testimonial.id} delay={i * 120}>
                  <TestimonialCard testimonial={testimonial} />
                </Reveal>
              ))}
            </div>
            <Reveal>
              <div className="mt-16 columns-2 gap-4 md:columns-3 lg:columns-4 [column-fill:_balance]">
                {images.reviews.map((src, i) => (
                  <div
                    key={src}
                    className="mb-4 break-inside-avoid overflow-hidden rounded-2xl ring-1 ring-sand-200 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-moss-900/10"
                  >
                    <img
                      src={src}
                      alt={`Guest review ${i + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="h-auto w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </Reveal>
          </>
        )}
      </div>
    </section>
  )
}

const initialForm = {
  name: '',
  email: '',
  phone: '',
  room: '',
  checkIn: '',
  checkOut: '',
  guests: '2',
  message: '',
}

function Contact({ settings, rooms = [], selectedRoom, onRoomChange, contactRef }) {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (selectedRoom) setForm((f) => ({ ...f, room: String(selectedRoom) }))
  }, [selectedRoom])

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
        villa_id: form.room ? Number(form.room) : null,
        check_in: form.checkIn || null,
        check_out: form.checkOut || null,
        guests: form.guests === '8+' ? 8 : Number(form.guests),
        message: form.message,
      })
      setSubmitted(true)
      onRoomChange('')
    } catch (err) {
      toast.error(err.message || 'Could not send your inquiry — please try again.')
    } finally {
      setSending(false)
    }
  }

  const resetForm = () => {
    setForm(initialForm)
    setSubmitted(false)
  }

  const inputClass =
    'w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-moss-900 placeholder:text-moss-800/40 transition-colors duration-300 focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/20'

  const phone = settings?.phone || '0777700680'
  const email = settings?.email || 'stay@orendagalle.com'
  const address = settings?.address || 'Orenda Eco lodge and Spa, Lighthouse Road, Koggala, Galle, Sri Lanka'
  const bookingUrl = settings?.booking_url || 'https://www.booking.com/Share-B0eRbU'
  const socials = socialNames
    .map((name) => ({ name, url: settings?.[`social_${name}`] }))
    .filter((social) => social.url)

  return (
    <section id="contact" className="py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-5" ref={contactRef}>
        <Reveal className="lg:col-span-3">
          <div className="rounded-3xl bg-white p-6 ring-1 ring-sand-200 sm:p-10">
            <SectionHeading
              align="left"
              eyebrow="Make an Inquiry"
              title="Plan your stay"
              description="Send us your dates or a question — no payment or commitment needed. We'll simply hold your room."
            />

            {submitted ? (
              <div className="mt-10 rounded-2xl bg-moss-50 p-8 text-center ring-1 ring-moss-100">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-moss-600 text-sand-50">
                  <Send size={22} />
                </span>
                <h3 className="mt-5 font-serif text-2xl font-semibold text-moss-900">
                  Thank you, {form.name || 'friend'}!
                </h3>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-moss-800/70">
                  Your inquiry is on its way. Our team will get back to you at{' '}
                  <span className="font-medium text-moss-900">{form.email}</span> as soon as
                  possible.
                </p>
                <button
                  type="button"
                  onClick={resetForm}
                  className="mt-6 text-sm font-medium uppercase tracking-wide text-brass-600 transition-colors hover:text-brass-500"
                >
                  Send another inquiry
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
                    Room
                  </span>
                  <select
                    name="room"
                    value={form.room}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">General inquiry</option>
                    {(rooms || []).map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
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
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-moss-800/70">
                    Message
                  </span>
                  <textarea
                    name="message"
                    rows={5}
                    required
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
                    {sending ? 'Sending…' : 'Submit Inquiry'}
                    <Send size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </Reveal>

        <Reveal delay={120} className="lg:col-span-2">
          <div className="flex h-full flex-col gap-6">
            <div className="rounded-3xl bg-brass-500 p-6 text-center text-forest-950 sm:p-8">
              <p className="font-serif text-xl font-semibold">Prefer to book directly?</p>
              <p className="mt-2 text-sm text-forest-950/80">
                Reserve your room instantly on Booking.com.
              </p>
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-forest-950 px-7 text-sm font-medium uppercase tracking-wide text-brass-300 transition-all duration-300 hover:bg-forest-900 hover:shadow-lg"
              >
                Book on Booking.com
                <ExternalLink size={16} />
              </a>
            </div>

            <div className="space-y-6 rounded-3xl bg-forest-950 p-6 text-sand-100 sm:p-8">
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-moss-800 text-brass-400">
                  <MapPin size={19} strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-400">
                    Address
                  </p>
                  <p className="mt-1 text-sm text-sand-100/85">{address}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-moss-800 text-brass-400">
                  <Phone size={19} strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-400">
                    Call us
                  </p>
                  <a
                    href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                    className="mt-1 block text-sm text-sand-100/85 transition-colors hover:text-brass-300"
                  >
                    {phone}
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-moss-800 text-brass-400">
                  <Mail size={19} strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-400">
                    Email us
                  </p>
                  <a
                    href={`mailto:${email}`}
                    className="mt-1 block text-sm text-sand-100/85 transition-colors hover:text-brass-300"
                  >
                    {email}
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-moss-800 text-brass-400">
                  <Users size={19} strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-400">
                    Reception
                  </p>
                  <p className="mt-1 text-sm text-sand-100/85">
                    {settings?.reception_hours || 'Daily · 7:00 AM – 10:00 PM'}
                  </p>
                </div>
              </div>
              <div className="border-t border-sand-200/10 pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-400">
                  Follow along
                </p>
                <div className="mt-4 flex gap-3">
                  {socials.map(({ name, url }) => (
                    <a
                      key={name}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={name}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-sand-200/20 text-sand-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-brass-400 hover:text-brass-400"
                    >
                      <SocialIcon name={name} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="group relative flex flex-1 items-center justify-center overflow-hidden rounded-3xl ring-1 ring-sand-200">
              <img
                src={images.nature[6]}
                alt="A quiet corner of the resort"
                loading="lazy"
                decoding="async"
                className="h-full min-h-[280px] w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-950/20 to-transparent" />
              <div className="absolute inset-0 flex items-end p-8">
                <p className="flex max-w-xs items-start gap-3 text-sm leading-relaxed text-sand-100/90">
                  <CalendarDays size={22} className="mt-0.5 shrink-0 text-brass-300" />
                  Use the inquiry form to check availability — we usually reply within a few
                  hours.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
