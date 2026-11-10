import { useEffect, type ElementType, type HTMLAttributes, type ReactNode } from "react"
import { cn } from "../lib"
import { BarsSpinner } from "./spinner"


const GAP = { 0: "gap-0", 1: "gap-1", 2: "gap-2", 3: "gap-3", 4: "gap-4", 5: "gap-5", 6: "gap-6", 8: "gap-8", 10: "gap-10" }
const ALIGN = { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" }
const JUSTIFY = { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between" }

type BoxProps = HTMLAttributes<HTMLElement> & { as?: ElementType }


export function Box({ as: Tag = 'div', ...rest }: BoxProps) {
    return <Tag {...rest} />
}


type ColumnProps = BoxProps & {
    line?: boolean
    gap?: keyof typeof GAP
    align?: keyof typeof ALIGN
    justify?: keyof typeof JUSTIFY
    wrap?: boolean
}

export function Column({ as: Tag = "div", line, gap = 4, align, justify, wrap, className, ...rest }: ColumnProps) {
    return <Tag
        className={cn(
            "flex flex-col",
            GAP[gap],
            align && ALIGN[align],
            justify && JUSTIFY[justify],
            wrap && "flex-wrap",
            line && "border-x border-line-soft py-3.5",
            className,
        )}
        {...rest}
    />
}


type RowProps = BoxProps & {
    line?: boolean
    gap?: keyof typeof GAP
    align?: keyof typeof ALIGN
    justify?: keyof typeof JUSTIFY
    wrap?: boolean
}

export function Row({ as: Tag = "div", line, gap = 3, align = "center", justify, wrap, className, ...rest }: RowProps) {
    return <Tag
        className={cn(
            "flex",
            GAP[gap],
            align && ALIGN[align],
            justify && JUSTIFY[justify],
            wrap && "flex-wrap",
            line && "border-b border-line-soft py-3.5",
            className,
        )}
        {...rest}
    />
}

export const Spacer = () => <div className="flex-1" />


type TextProps = HTMLAttributes<HTMLElement> & {
    as?: ElementType
    xl?: boolean
    md?: boolean
    muted?: boolean
    bold?: boolean
    sm?: boolean
}

export function Text({ as, xl, md, muted, bold, sm, className, ...rest }: TextProps) {
    const Tag = as ?? (xl ? "h1" : md ? "h3" : "span")

    return <Tag
        className={cn(
            xl && "text-4xl",
            md && "text-xl",
            muted && "text-mocha",
            bold && "font-bold",
            sm && "text-sm",
            className,
        )}
        {...rest}
    />
}


type SectionProps = BoxProps & {
    dark?: boolean
    sm?: boolean
    transparent?: boolean
    late?: boolean
    border?: boolean
}

export function Section({ as: Tag = "section", dark, border, sm, transparent, late, className, ...rest }: SectionProps) {
    return <Tag
        className={cn(
            "flex flex-col rounded-2xl p-6 gap-3 bg-foam",
            border && "border-line border-2",
            transparent && "bg-transparent",
            dark && "bg-oat",
            sm && "gap-2 rounded-xl p-3.5",
            late && "shadow-[inset_5px_0_var(--color-rust)]",
            className,
        )}
        {...rest}
    />
}


type GridProps = BoxProps & {
    min?: number
    gap?: keyof typeof GAP
    fit?: boolean
}

export function Grid({ as: Tag = "div", min = 250, gap = 5, fit, className, style, ...rest }: GridProps) {
    return <Tag
        className={cn("grid items-start", GAP[gap], className)}
        style={{ gridTemplateColumns: `repeat(${fit ? "auto-fit" : "auto-fill"}, minmax(${min}px, 1fr))`, ...style }}
        {...rest}
    />
}


type ButtonProps = HTMLAttributes<HTMLButtonElement> & {
    submit?: boolean
    onClick?: () => void
    className?: string
    gold?: boolean
    ghost?: boolean
    link?: boolean
    dark?: boolean
    sm?: boolean
    tab?: boolean 
    disabled?: boolean
    loading?: boolean
}

export function Button({ children, submit, onClick, gold, ghost, link, dark, sm, tab, className, loading, disabled }: ButtonProps) {
    return (
        <button
            className={cn(
                `inline-grid grid-cols-1 grid-rows-1 items-center 
                justify-items-center justify-content-center rounded-xl 
                bg-espresso px-5.5 py-3 font-bold text-milk transition-all 
                disabled:cursor-not-allowed disabled:opacity-45 disabled:grayscale-[.3]`,
                gold && 'bg-crema text-espresso',
                ghost && 'bg-transparent text-espresso border-2 border-espresso border-solid',
                link && 'bg-transparent px-1 py-0.5 text-espresso underline underline-offset-4 hover:text-mocha',
                dark && 'bg-roast text-milk',
                ghost && dark && 'border-milk text-milk',
                link && dark && 'text-milk hover:text-crema',
                sm && 'px-3.5 py-1.5 text-sm rounded-lg',
                tab && 'bg-transparent rounded-none border-b-2 border-transparent text-espresso/70 hover:text-espresso px-4 py-2 font-medium',
                tab && dark && 'text-milk/70 hover:text-milk',
                className
            )}
            onClick={onClick}
            disabled={disabled || loading}
            type={submit ? 'submit' : 'button'}
        >
            {loading && (
                <div className="col-start-1 row-start-1 z-10 flex items-center justify-center">
                    <BarsSpinner className="h-5" />
                </div>
            )}

            <span className={cn(
                "col-start-1 row-start-1 flex items-center gap-2",
                loading && "invisible"
            )}>
                {children}
            </span>
        </button>
    )
}

export function Container({ as: Tag = "div", narrow, className, ...rest }: BoxProps & { narrow?: boolean }) {
    return (
        <Tag 
            className={cn(
                "mx-auto w-full grid grid-cols-1 gap-6", 
                narrow ? "max-w-100" : "max-w-260", 
                className
            )} 
            {...rest} 
        />
    )
}

export function Page({ className, ...rest }: BoxProps) {
    return <Container as="main" className={cn("px-5 pt-8 pb-16", className)} {...rest} />
}

type StepProps = HTMLAttributes<HTMLElement> & {
    done?: boolean
    current?: boolean
}

export function Step({ children, done, current }: StepProps) {
    return (
        <div
            className={cn(
                "flex-1 text-center text-mocha text-sm",
                current && "text-espresso font-bold"
            )}
        >
            <i className={cn(
                "block w-5.5 h-5.5 rounded-[50%] bg-line m-auto",
                done && "bg-crema",
                current && "bg-espresso shadow-crema" 
            )} />
            {children}
        </div>
    )
}

type ModalProps = {
    title: string
    onClose: () => void
    wide?: boolean
    children: ReactNode
}

export function Modal({ title, onClose, wide, children }: ModalProps) {
    useEffect(() => {
        const h = (e: KeyboardEvent) => e.key === "Escape" && onClose()
        window.addEventListener("keydown", h)
        return () => window.removeEventListener("keydown", h)
    }, [onClose])

    return (
        <div
            className="fixed inset-0 z-10 grid place-items-center bg-espresso/65 p-4"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={cn(
                    "flex max-h-[calc(100vh-32px)] flex-col rounded-3xl bg-foam",
                    wide ? "w-[min(620px,100%)]" : "w-[min(460px,100%)]",
                )}
            >
                <h2 className="shrink-0 px-7 pt-7 pb-3.5 text-2xl">{title}</h2>
                <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3.5 overflow-auto px-7 pb-7">
                    {children}
                </div>
            </div>
        </div>
    )
}