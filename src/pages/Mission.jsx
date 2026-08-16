import { Leaf, HeartHandshake, Users, ArrowRight } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import SectionHeading from '../components/ui/SectionHeading'
import Reveal from '../components/ui/Reveal'
import Button from '../components/ui/Button'
import { images } from '../data/images'
import { useSectionNav } from '../hooks/useSectionNav'

const pillars = [
  {
    icon: Leaf,
    title: 'Protect the land',
    text: 'Solar power, no single-use plastics and a gentle footprint across the gardens, mangroves and shoreline that surround the rooms.',
  },
  {
    icon: HeartHandshake,
    title: 'Serve the community',
    text: 'We buy from local growers, employ from the village and share the south coast with the people who have called it home for generations.',
  },
  {
    icon: Users,
    title: 'Care for our guests',
    text: 'Small, personal and unhurried — every stay is shaped around rest, connection and the rhythm of the ocean.',
  },
]

export default function Mission() {
  const goToInquiry = useSectionNav()

  return (
    <>
      <PageHeader
        title="Our Mission"
        subtitle="“To welcome every traveller with genuine warmth, exceptional service, and meaningful experiences—creating a global hospitality brand where every guest feels at home, wherever they are in the world.”"
        image={images.about.story}
      />

      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Why we exist"
              title="Hospitality that gives back"
              description="Orenda was founded in 2022 with a simple belief: a luxury stay should never come at nature's expense."
            />
          </Reveal>

          <div className="mx-auto mt-10 max-w-3xl">
            <Reveal>
              <p className="text-center leading-relaxed text-moss-800/75">
                Our mission is to run a genuinely eco-conscious resort — solar-powered,
                plastic-free and deeply local — while delivering the comfort and care of a
                world-class guest experience. Every choice, from the timber we build with to
                the food we serve, is made with the mangroves, the ocean and the village in
                mind.
              </p>
            </Reveal>
          </div>

          <Reveal>
            <img
              src={images.mission}
              alt="The resort, gardens and mangroves"
              loading="lazy"
              decoding="async"
              className="mt-16 aspect-[21/9] w-full rounded-3xl object-cover shadow-xl shadow-moss-900/10"
            />
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, text }, i) => (
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
              eyebrow="Plan your stay"
              title="Experience our mission firsthand"
              description="Come and see how sustainable hospitality feels — we would love to welcome you."
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
