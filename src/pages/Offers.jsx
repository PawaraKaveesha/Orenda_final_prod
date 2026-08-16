import PageHeader from '../components/ui/PageHeader'
import Reveal from '../components/ui/Reveal'
import OfferCard from '../components/ui/OfferCard'
import SectionHeading from '../components/ui/SectionHeading'
import Button from '../components/ui/Button'
import { useApi } from '../hooks/useApi'
import { listActiveOffers } from '../api/offers'
import { images, localFlyers } from '../data/images'

const headerImage = images.pages.offers

export default function Offers() {
  const { data: apiItems } = useApi(listActiveOffers)
  const items = (apiItems && apiItems.length > 0) ? apiItems : localFlyers

  return (
    <>
      <PageHeader
        title="Offers & Packages"
        subtitle="Thoughtfully crafted escapes — from honeymoons to long slow stays — always rooted in the nature around us."
        image={headerImage}
      />

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((offer, i) => (
              <Reveal key={offer.id || i} delay={(i % 3) * 120}>
                <OfferCard offer={offer} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-950 py-20 sm:py-24">
        <Reveal className="mx-auto max-w-3xl px-5 text-center">
          <SectionHeading
            dark
            eyebrow="Tailor-made"
            title="Planning something special?"
            description="Birthdays, retreats, reunions or 'no reason at all' — tell us what you're dreaming of and we'll craft a package around it."
          />
          <div className="mt-9">
            <Button to="/contact" variant="light" size="lg">
              Build My Stay
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  )
}
