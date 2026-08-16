export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  dark = false,
}) {
  const alignment =
    align === 'center' ? 'mx-auto text-center' : 'text-left'

  return (
    <div className={`max-w-2xl ${alignment}`}>
      {eyebrow && (
        <p
          className={`text-xs font-semibold uppercase tracking-[0.25em] ${
            dark ? 'text-brass-400' : 'text-brass-600'
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl ${
          dark ? 'text-sand-50' : 'text-moss-900'
        }`}
      >
        {title}
      </h2>
      <div
        className={`mt-4 h-px w-16 ${
          align === 'center' ? 'mx-auto' : ''
        } bg-brass-500`}
      />
      {description && (
        <p
          className={`mt-5 text-base leading-relaxed sm:text-lg ${
            dark ? 'text-sand-200/80' : 'text-moss-800/70'
          }`}
        >
          {description}
        </p>
      )}
    </div>
  )
}
