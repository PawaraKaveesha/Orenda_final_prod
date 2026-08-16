import { Link } from 'react-router-dom'

const base =
  'inline-flex min-h-11 items-center justify-center whitespace-nowrap gap-2 rounded-full font-semibold uppercase tracking-wide transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 focus-visible:ring-offset-2'

const variants = {
  primary:
    'bg-brass-500 text-white hover:bg-brass-600 hover:shadow-lg hover:shadow-brass-500/30',
  outline:
    'border border-moss-600 text-moss-600 hover:bg-moss-600 hover:text-white',
  light:
    'bg-brass-500 text-white hover:bg-brass-600 hover:shadow-lg hover:shadow-brass-500/30',
  ghost:
    'border border-sand-200/60 text-sand-100 hover:bg-sand-50/10',
}

const sizes = {
  sm: 'px-5 py-2 text-xs',
  md: 'px-7 py-3 text-sm',
  lg: 'px-8 py-3.5 text-sm sm:px-9 sm:py-4',
}

export default function Button({
  to,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick} {...rest}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" className={classes} onClick={onClick} {...rest}>
      {children}
    </button>
  )
}
