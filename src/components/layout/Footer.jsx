import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin } from 'lucide-react'
import SocialIcon, { socialNames } from '../ui/SocialIcon'
import { useSectionNav } from '../../hooks/useSectionNav'
import { useApi } from '../../hooks/useApi'
import { getPublicSettings } from '../../api/settings'

const pageLinks = [
  { to: '/', label: 'About Us' },
  { to: '/mission', label: 'Our Mission' },
  { to: '/vision', label: 'Our Vision' },
]

const sectionLinks = [
  { id: 'rooms', label: 'Rooms' },
  { id: 'gallery', label: 'Gallery' },
]

export default function Footer() {
  const goToSection = useSectionNav()
  const settings = useApi(getPublicSettings)

  const phone = settings.data?.phone || '0777700680'
  const email = settings.data?.email || 'stay@orendagalle.com'
  const address =
    settings.data?.address ||
    'Orenda Eco lodge and Spa, Lighthouse Road, Koggala, Galle, Sri Lanka'
  const bookingUrl = settings.data?.booking_url || 'https://www.booking.com/Share-B0eRbU'
  const socials = socialNames
    .map((name) => ({ name, url: settings.data?.[`social_${name}`] }))
    .filter((social) => social.url)

  return (
    <footer className="bg-forest-950 text-sand-200">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 text-center sm:px-8 sm:text-left md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col items-center sm:items-start">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brass-500 text-brass-400">
              <span className="font-serif text-lg font-semibold">O</span>
            </span>
            <span className="font-serif text-2xl font-bold tracking-wide text-sand-100">
              Orenda <span className="text-brass-400">Eco lodge and Spa</span>
            </span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-sand-200/70">
            A small, soulful eco resort on Sri Lanka's southern coast. Comfortable rooms, two
            acres of native gardens, and an ocean that never stops moving.
          </p>
        </div>

        <div className="flex flex-col items-center sm:items-start">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-400">
            Explore
          </h3>
          <ul className="mt-5 space-y-3 text-sm">
            {pageLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="transition-colors duration-300 hover:text-brass-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {sectionLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    goToSection(link.id)
                  }}
                  className="transition-colors duration-300 hover:text-brass-400"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault()
                  goToSection('contact')
                }}
                className="font-medium text-brass-400 transition-colors duration-300 hover:text-brass-300"
              >
                Make an Inquiry
              </a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col items-center sm:items-start">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-400">
            Contact
          </h3>
          <ul className="mt-5 space-y-4 text-sm text-sand-200/80">
            <li className="flex items-start justify-center gap-3 sm:justify-start">
              <MapPin size={18} className="mt-0.5 shrink-0 text-brass-400" />
              <span>{address}</span>
            </li>
            <li className="flex items-center justify-center gap-3 sm:justify-start">
              <Phone size={18} className="shrink-0 text-brass-400" />
              <a
                href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                className="transition-colors hover:text-brass-400"
              >
                {phone}
              </a>
            </li>
            <li className="flex items-center justify-center gap-3 sm:justify-start">
              <Mail size={18} className="shrink-0 text-brass-400" />
              <a
                href={`mailto:${email}`}
                className="transition-colors hover:text-brass-400"
              >
                {email}
              </a>
            </li>
            <li className="flex items-center justify-center gap-3 sm:justify-start">
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brass-400 transition-colors hover:text-brass-300"
              >
                Book on Booking.com
              </a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col items-center sm:items-start">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-400">
            Follow Us
          </h3>
          <p className="mt-5 max-w-xs text-sm text-sand-200/70">
            Daily moments from the rooms, gardens and the shore.
          </p>
          <div className="mt-5 flex gap-3">
            {socials.map(({ name, url }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-sand-200/20 text-sand-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-brass-400 hover:text-brass-400"
              >
                <SocialIcon name={name} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-sand-200/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-center text-xs text-sand-200/50 sm:flex-row sm:px-8 sm:text-left">
          <p>© {new Date().getFullYear()} Orenda Eco lodge and Spa. All rights reserved.</p>
          <p>Crafted with care on the south coast of Sri Lanka.</p>
        </div>
      </div>
    </footer>
  )
}
