import { Sprout, Globe, Sunrise, ArrowRight } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import SectionHeading from '../components/ui/SectionHeading'
import Reveal from '../components/ui/Reveal'
import Button from '../components/ui/Button'
import { images } from '../data/images'
import { useSectionNav } from '../hooks/useSectionNav'

const aspirations = [
  {
    icon: Sprout,
    title: 'A sanctuary that grows',
    text: 'More native trees each year, richer gardens, and quieter shores — a landscape that is healthier for every season we stay open.',
  },
  {
    icon: Globe,
    title: 'Travel that restores',
    text: 'A model of eco-lodging that proves comfort and conservation belong together, inspiring guests to carry sustainability home.',
  },
  {
    icon: Sunrise,
    title: 'Gentle, lasting impact',
    text: 'An ever-stronger bond with the Galle community — local hands, local food and local pride in everything we share.',
  },
]

export default function Vision() {
  const goToInquiry = useSectionNav()

  return (
    <>
      <PageHeader
        title="Our Vision"
        subtitle="“To inspire the world through exceptional hospitality, one unforgettable stay at a time.”"
        image={images.about.forest}
      />

      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Where we are going"
              title="Regenerative hospitality"
              description="Our vision is simple and patient: to become a model eco-resort on the south coast, year after year."
            />
          </Reveal>

          <div className="mx-auto mt-10 max-w-3xl">
            <Reveal>
              <p className="text-center leading-relaxed text-moss-800/75">
                We imagine an Orenda that gives back more than it takes — a place where the
                gardens grow wilder, the mangroves thrive, and every guest leaves feeling
                lighter and more connected to the natural world. Growth for us means depth,
                not size: fewer footprints, warmer welcomes and a resort that becomes a
                sanctuary for people and wildlife alike.
              </p>
            </Reveal>
          </div>

          <Reveal>
            <img
              src={images.vision}
              alt="Native gardens and the shore at Orenda"
              loading="lazy"
              decoding="async"
              className="mt-16 aspect-[21/9] w-full rounded-3xl object-cover shadow-xl shadow-moss-900/10"
            />
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {aspirations.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 120}>
                <div className="group h-full rounded-2xl border border-sand-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-moss-300 hover:shadow-xl hover:shadow-moss-900/10">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-moss-100 text-moss-600 transition-all duration-300 group-hover:bg-moss-500 group-hover:text-white">
                    <Icon size={22} strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 font-serif text-xl font-semibold text-moss-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-moss-800/65">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-950 py-24 sm:py-28">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <Reveal>
            <SectionHeading
              dark
              eyebrow="Join the journey"
              title="Be part of what we are building"
              description="Come for the nature, stay for the vision — we would love to welcome you to the south coast."
            />
            <div className="mt-10 flex justify-center">
              <Button onClick={() => goToInquiry('contact')} variant="light" size="lg">
                Make an Inquiry <ArrowRight size={16} />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
