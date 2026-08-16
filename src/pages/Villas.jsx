import PageHeader from '../components/ui/PageHeader'
import Reveal from '../components/ui/Reveal'
import VillaCard from '../components/ui/VillaCard'
import Button from '../components/ui/Button'
import Loading from '../components/ui/Loading'
import ErrorMessage from '../components/ui/ErrorMessage'
import { useApi } from '../hooks/useApi'
import { listVillas } from '../api/villas'
import { images } from '../data/images'

const headerImage = images.pages.villas

export default function Villas() {
  const { data: items, loading, error, refetch } = useApi(listVillas)

  return (
    <>
      <PageHeader
        title="Our Villas"
        subtitle="Three hand-built villas, each with its own personality — garden, pool or shoreline. Private, self-catering, and entirely yours."
        image={headerImage}
      />

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {error ? (
            <ErrorMessage error={error} onRetry={refetch} />
          ) : loading && !items ? (
            <Loading />
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {(items || []).map((villa, i) => (
                <Reveal key={villa.id} delay={i * 120}>
                  <VillaCard villa={villa} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-moss-50 py-20 sm:py-24">
        <Reveal className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-serif text-3xl text-moss-900 sm:text-4xl">Can't decide?</h2>
          <p className="mx-auto mt-4 max-w-xl text-moss-800/70">
            Every villa includes daily breakfast, airport transfers on stays of four
            nights or more, and a concierge who knows the south coast like family.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button to="/contact">Talk to Us</Button>
            <Button to="/offers" variant="outline">
              See Offers
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  )
}
