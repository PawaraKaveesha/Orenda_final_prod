import Button from './Button'

export default function OfferCard({ offer }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-sand-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-moss-900/15">
      <div className="relative flex w-full min-h-[260px] items-center justify-center overflow-hidden bg-sand-100/60 p-3 sm:p-4">
        <img
          src={offer.image}
          alt={offer.name}
          loading="lazy"
          decoding="async"
          className="h-auto max-h-[420px] w-full rounded-2xl object-contain shadow-sm transition-transform duration-700 group-hover:scale-105"
        />
        {offer.savings && (
          <span className="absolute left-5 top-5 rounded-full bg-brass-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-forest-950 shadow-sm">
            {offer.savings}
          </span>
        )}
        {offer.tagline && (
          <span className="absolute right-5 top-5 rounded-full bg-sand-50/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-moss-800 backdrop-blur shadow-sm">
            {offer.tagline}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        {offer.duration && (
          <p className="text-[11px] uppercase tracking-widest text-brass-600">
            {offer.duration}
          </p>
        )}
        <h3 className="mt-1 font-serif text-2xl font-semibold text-moss-900">{offer.name}</h3>

        <p className="mt-3 text-sm leading-relaxed text-moss-800/70">
          {offer.description}
        </p>

        {offer.perks && offer.perks.length > 0 && (
          <ul className="mt-5 space-y-2.5">
            {offer.perks.map((perk) => (
              <li key={perk} className="flex items-start gap-2.5 text-sm text-moss-800/80">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brass-500" />
                {perk}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-6">
          <p className="text-sm text-moss-800/70">
            Contact us for latest package details.
          </p>
          <Button href="#contact" size="sm" variant="outline">
            Inquire
          </Button>
        </div>
      </div>
    </article>
  )
}

