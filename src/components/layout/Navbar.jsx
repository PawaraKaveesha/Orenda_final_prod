import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Button from '../ui/Button'
import { useSectionNav } from '../../hooks/useSectionNav'
import logo from '../../assets/logo.png'

const pageLinks = [
  { to: '/', label: 'About Us' },
  { to: '/mission', label: 'Our Mission' },
  { to: '/vision', label: 'Our Vision' },
]

const sectionLinks = [
  { id: 'rooms', label: 'Rooms' },
  { id: 'gallery', label: 'Gallery' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const goToSection = useSectionNav()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const solid = scrolled || open

  const handleSectionClick = (e, id) => {
    e.preventDefault()
    setOpen(false)
    goToSection(id)
  }

  const pageLinkClass = ({ isActive }) =>
    `relative py-2 text-sm tracking-wide uppercase transition-colors duration-300 hover:text-moss-600 ${
      isActive
        ? 'text-brass-600 after:absolute after:-bottom-0.5 after:left-1/2 after:h-0.5 after:w-6 after:-translate-x-1/2 after:rounded-full after:bg-brass-500'
        : solid
          ? 'text-moss-800'
          : 'text-white'
    }`

  const sectionLinkClass = solid ? 'text-moss-800 hover:text-moss-600' : 'text-white hover:text-moss-600'

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid ? 'bg-sand-50/95 shadow-lg shadow-moss-900/5 backdrop-blur' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8 sm:py-4">
        <Link to="/" className="group flex min-w-0 items-center gap-2.5" onClick={() => setOpen(false)}>
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
              solid ? 'border-brass-500 text-brass-600' : 'border-brass-400/70 text-brass-300'
            }`}
          >
            <img src={logo} alt="Orenda logo" className="h-6 w-6 rounded-full object-contain" />
          </span>
          <span
            className={`font-serif text-xl font-bold tracking-wide transition-colors duration-300 sm:text-2xl ${
              solid ? 'text-moss-900' : 'text-white'
            }`}
          >
            Orenda <span className="hidden whitespace-nowrap text-brass-500 sm:inline">Eco lodge and Spa</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-6 lg:flex">
          {pageLinks.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={pageLinkClass}>
                {link.label}
              </NavLink>
            </li>
          ))}
          {sectionLinks.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                onClick={(e) => handleSectionClick(e, link.id)}
                className={`relative py-2 text-sm tracking-wide uppercase transition-colors duration-300 ${sectionLinkClass}`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden shrink-0 lg:block">
          <Button onClick={() => goToSection('contact')} size="sm">
            Make an Inquiry
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors lg:hidden ${
            solid ? 'text-moss-900' : 'text-white'
          }`}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={`grid overflow-hidden transition-all duration-300 ease-out lg:hidden ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0">
          <ul className="flex flex-col border-t border-sand-200 bg-sand-50 px-5 py-2">
            {pageLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center text-sm uppercase tracking-wide transition-colors hover:text-moss-600 ${
                      isActive ? 'font-semibold text-brass-600' : 'text-moss-800'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            {sectionLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={(e) => handleSectionClick(e, link.id)}
                  className="flex min-h-11 items-center text-sm uppercase tracking-wide text-moss-800 transition-colors hover:text-moss-600"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="py-3">
              <Button
                onClick={() => {
                  setOpen(false)
                  goToSection('contact')
                }}
                className="w-full justify-center"
              >
                Make an Inquiry
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}
