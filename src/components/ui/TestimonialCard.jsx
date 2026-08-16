import { Star, Quote } from 'lucide-react'

export default function TestimonialCard({ testimonial }) {
  return (
    <figure className="relative flex h-full flex-col rounded-3xl bg-white p-6 ring-1 ring-sand-200 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-moss-900/10 sm:p-8">
      <Quote
        size={44}
        className="absolute right-7 top-7 text-sand-200"
        aria-hidden="true"
      />
      <div className="flex gap-1 text-brass-500">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
        ))}
      </div>
      <blockquote className="mt-5 flex-1 font-serif text-xl italic leading-relaxed text-moss-800">
        “{testimonial.quote}”
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-4 border-t border-sand-200 pt-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-moss-100 font-serif text-lg font-semibold text-moss-700">
          {testimonial.name.charAt(0)}
        </span>
        <div>
          <p className="text-sm font-semibold text-moss-900">{testimonial.name}</p>
          <p className="text-xs uppercase tracking-wider text-moss-800/60">
            {testimonial.location}
          </p>
        </div>
      </figcaption>
    </figure>
  )
}
