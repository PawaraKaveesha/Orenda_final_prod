import { useNavigate, useLocation } from 'react-router-dom'

export function useSectionNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (id) => {
    if (pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/', { state: { scrollTo: id } })
    }
  }
}
