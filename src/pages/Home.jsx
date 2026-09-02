import { ArrowDown, Leaf } from 'lucide-react'
import Button from '../components/ui/Button'
import SectionHeading from '../components/ui/SectionHeading'
import Reveal from '../components/ui/Reveal'
import VillaCard from '../components/ui/VillaCard'
import TestimonialCard from '../components/ui/TestimonialCard'
import Loading from '../components/ui/Loading'
import ErrorMessage from '../components/ui/ErrorMessage'
import { amenities } from '../data/amenities'
import { images } from '../data/images'
import { useApi } from '../hooks/useApi'
import { listVillas } from '../api/villas'
import { listTestimonials } from '../api/testimonials'
import { listGallery } from '../api/gallery'

const heroImage = images.hero

const welcomeImage = images.welcome

const stats = [
  { value: '5', label: 'Years of hospitality' },
  { value: '3', label: 'Private villas' },
  { value: '2', label: 'Acres of gardens' },
  { value: '0', label: 'Plastic on property' },
]

export default function Home() {
  const villas = useApi(listVillas)
  const testimonials = useApi(listTestimonials)
  const gallery = useApi(listGallery)

  return (
    <>
      <Hero />
      <Welcome />
      <FeaturedVillas data={villas} />
      <Amenities />
      <Gallery data={gallery} />
      <Testimonials data={testimonials} />
      <CtaBanner />
    </>
  )
}

function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
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
        <h1 className="mt-6 animate-fade-up font-serif text-4xl leading-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
          Slow Days,
          <br />
          <span className="italic text-brass-300">Soft Sands,</span> Wild Gardens
        </h1>
        <p className="mx-auto mt-8 max-w-xl animate-fade-up text-base leading-relaxed text-sand-100/90 sm:text-lg">
          Three private villas tucked between the mangroves and the Indian Ocean —
          built from timber, powered by the sun, and tuned to the rhythm of the
          tide.
        </p>
        <div className="mt-10 flex animate-fade-up flex-wrap items-center justify-center gap-4">
          <Button to="/contact" variant="light" size="lg">
            Book Now
          </Button>
          <Button to="/villas" variant="ghost" size="lg">
            Explore Villas
          </Button>
        </div>
      </div>

      <a
        href="#welcome"
        aria-label="Scroll to explore"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce text-sand-100/80 transition-colors hover:text-brass-300"
      >
        <ArrowDown size={22} />
      </a>
    </section>
  )
}

function Welcome() {
  return (
    <section id="welcome" className="py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
        <Reveal>
          <div className="relative">
            <img
              src={welcomeImage}
              alt="Resort pool at dusk surrounded by palms"
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] w-full rounded-3xl object-cover shadow-2xl shadow-moss-900/20"
            />
            <div className="absolute -bottom-6 -right-4 hidden rounded-2xl bg-moss-700 px-8 py-6 text-sand-50 shadow-xl sm:block lg:-right-8">
              <p className="font-serif text-5xl">Est.</p>
              <p className="text-xs uppercase tracking-[0.25em] text-brass-300">
                2022 · Galle
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <SectionHeading
            align="left"
            eyebrow="Welcome to Orenda"
            title="A small resort with a big heart for the planet"
          />
          <p className="mt-6 leading-relaxed text-moss-800/75">
            Orenda eco resort and spa began with a simple idea: luxury should never come at the
            expense of the land it stands on. Our three villas — Araliya, Ehela and
            Karada — are hand-built from reclaimed timber and local stone, cooled by
            ocean breezes, and powered almost entirely by the sun.
          </p>
          <p className="mt-4 leading-relaxed text-moss-800/75">
            Days here move slowly. Swim at low tide, wander through two acres of
            native gardens, eat what our kitchen garden grew that morning, and fall
            asleep to the sound of waves and geckos.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button to="/about">Our Story</Button>
            <Button to="/villas" variant="outline">
              The Villas
            </Button>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-sand-200 pt-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-4xl text-moss-700">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-moss-800/60">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function FeaturedVillas({ data }) {
  const { data: items, loading, error, refetch } = data
  return (
    <section className="bg-moss-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Stay with us"
            title="Three villas, three moods"
            description="Each villa is private, self-catering and set within the gardens — choose your pace of paradise."
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
            {(items || []).map((villa, i) => (
              <Reveal key={villa.id} delay={i * 120}>
                <VillaCard villa={villa} />
              </Reveal>
            ))}
          </div>
        )}
        <Reveal className="mt-12 text-center">
          <Button to="/villas" variant="outline" size="lg">
            View All Villas
          </Button>
        </Reveal>
      </div>
    </section>
  )
}

function Amenities() {
  return (
    <section className="py-24 sm:py-32">
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
                <h3 className="mt-4 font-serif text-xl text-moss-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-moss-800/65">
                  {description}
                </p>
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
    <section className="bg-forest-950 py-24 sm:py-32">
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
            {(items || []).slice(0, 8).map((image, i) => (
              <Reveal key={image.src || image.id} delay={(i % 4) * 80}>
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

function Testimonials({ data }) {
  const { data: items, loading, error, refetch } = data
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Testimonials"
            title=" from our guests"
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
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(items || []).map((testimonial, i) => (
              <Reveal key={testimonial.name} delay={i * 120}>
                <TestimonialCard testimonial={testimonial} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function CtaBanner() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <img
        src={images.cta}
        alt=""
        aria-hidden="true"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-moss-800/80" />
      <Reveal className="relative z-10 mx-auto max-w-3xl px-5 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass-400 text-forest-950">
          <Leaf size={24} />
        </span>
        <h2 className="mt-6 font-serif text-3xl text-sand-50 sm:text-4xl lg:text-5xl">
          Your slow days are waiting
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sand-100/85">
          Peak season books quickly. Send us your dates and we'll hold a villa for
          you — no payment needed until you're ready.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Button to="/contact" variant="light" size="lg">
            Check Availability
          </Button>
          <Button to="/offers" variant="ghost" size="lg">
            Current Offers
          </Button>
        </div>
      </Reveal>
    </section>
  )
}
