import type { FormHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "../lib";

export function Form({ className, ...rest }: FormHTMLAttributes<HTMLFormElement>) {
    return <form className={cn("flex flex-col gap-3.5", className)} {...rest} />;
}


export function FormActions({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("mt-1.5 flex justify-end gap-2.5", className)} {...rest} />;
}


type FormFieldProps = {
    label: ReactNode
    hint?: ReactNode
    radio?: boolean
    className?: string
    children: ReactNode
}

export function FormField({ label, hint, radio, className, children }: FormFieldProps) {
    const Tag = radio ? "div" : "label"

    return <Tag className={cn("flex flex-col gap-1.5 text-sm font-medium flex-1", className)}>
        {label}
        {children}
        {hint && <span className="text-[13px] font-normal text-mocha">{hint}</span>}
    </Tag>
}


export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
        className={cn(
            "w-full rounded-xl border-[1.5px] border-line bg-white px-3 py-2.5 font-normal text-espresso placeholder:text-mauve-500",
            className,
        )}
        {...rest}
        />
    )
}


type ChoiceProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
    multiple?: boolean
}

export function Choice({ multiple, className, children, ...rest }: ChoiceProps) {
    return <label className={cn("block cursor-pointer", className)}>
        <input type={multiple ? "checkbox" : "radio"} className="peer sr-only" {...rest} />
        <span className="flex w-full justify-between rounded-xl border-[1.5px] border-line px-3.5 py-2.5 text-left peer-checked:border-espresso peer-checked:bg-latte peer-focus-visible:outline-3 peer-focus-visible:outline-crema">
            {children}
        </span>
    </label>
}


interface FormErrorProps {
    error?: string
}

export function FormError({ error }: FormErrorProps) {    
    if (!error) return null

    return (
        <span className="text-sm text-rust">
            {error}
        </span>
    )
}

export function Select({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            className={cn(
                "w-full rounded-xl border-[1.5px] border-line bg-white px-3 py-2.5 font-normal text-espresso",
                className,
            )}
            {...rest}
        />
    )
}