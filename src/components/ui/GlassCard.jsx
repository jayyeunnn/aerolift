/**
 * Reusable glassmorphism card component
 * Matches the .glass-card CSS class from the design system
 */
export default function GlassCard({
  children,
  className = '',
  padding = 'p-6',
  hover = false,
  onClick,
  ...props
}) {
  return (
    <div
      className={`glass-card ${padding} ${
        hover ? 'hover:scale-[1.01] cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}
