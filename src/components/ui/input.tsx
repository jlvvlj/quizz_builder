import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
    <input
        type={type}
        ref={ref}
        className={cn(
            "flex h-10 w-full rounded-md border border-[#4F4F4F] bg-[#262626] px-3 py-2 text-sm text-white placeholder:text-[#6F6F6F] focus:outline-none focus:border-[#FF0054] disabled:cursor-not-allowed disabled:opacity-50",
            className
        )}
        {...props}
    />
))
Input.displayName = "Input"

export { Input }
