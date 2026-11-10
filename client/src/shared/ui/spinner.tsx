import { cn } from "../lib";

type Props = { className?: string };

export function Spinner({ className }: Props) {
    return (
        <span
            role="status"
            aria-label="Загрузка"
            className={cn(
                "inline-block size-8 animate-spin rounded-full border-4 border-current border-t-transparent text-crema",
                className,
            )}
        />
    )
}

export function BarsSpinner({ className }: Props) {
    return (
        <span
            role="status"
            aria-label="Загрузка"
            className={cn("inline-flex h-8 items-end gap-1", className)}
        >
            {[0, 1, 2, 3].map((i) => 
                <span
                    key={i}
                    className="h-full w-1.5 origin-bottom animate-equalizer rounded-full bg-current"
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
            )}
        </span>
    )
}

export function DotsSpinner({ className }: Props) {
    return (
        <span
            role="status"
            aria-label="Загрузка"
            className={cn("inline-flex items-center gap-1", className)}
        >
            {[0, 1, 2].map((i) => 
                <span
                    key={i}
                    className="size-2 animate-dot-bounce rounded-full bg-current"
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
            )}
        </span>
    )
}