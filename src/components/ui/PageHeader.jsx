import Reveal from './Reveal'

export default function PageHeader({ title, subtitle, image }) {
  return (
    <section className="relative flex min-h-[55vh] items-center justify-center overflow-hidden pt-24 pb-24 sm:min-h-[60vh] sm:pt-28">
      <img
        src={image}
        alt=""
        aria-hidden="true"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-forest-950/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-forest-950/40 via-transparent to-sand-50/80" />

      <Reveal className="relative z-10 w-full max-w-3xl px-5 text-center">
        <h1 className="font-serif text-4xl font-bold leading-tight text-sand-50 sm:text-5xl md:text-6xl lg:text-7xl">
          {title}
        </h1>
        <div className="mx-auto mt-5 h-px w-20 bg-brass-400" />
        {subtitle && (
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-sand-200/90 sm:text-lg">
            {subtitle}
          </p>
        )}
      </Reveal>
    </section>
  )
}
