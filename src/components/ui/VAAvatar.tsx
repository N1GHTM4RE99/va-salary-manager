import { getInitials, getColorFromName } from '../../lib/salary'

interface VAAvatarProps {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
}

export function VAAvatar({ name, src, size = 'md' }: VAAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-xl'
  }
  
  const initials = getInitials(name)
  const bgColor = getColorFromName(name)
  
  if (src) {
    return (
      <img 
        src={src} 
        alt={name} 
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    )
  }
  
  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold`}
      style={{ backgroundColor: bgColor }}
    >
      {initials}
    </div>
  )
}
