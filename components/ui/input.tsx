import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-white/15 bg-rally-card px-3 py-2 text-sm text-white placeholder:text-rally-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rally-accent',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'
