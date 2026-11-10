import { AlertTriangle, type LucideIcon } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { BarsSpinner } from "./spinner";
import { cn } from "../lib";
import { Button } from "./layout";

type FeedbackProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
    icon?: LucideIcon
    media?: ReactNode
    tone?: "neutral" | "error"
    title: string
    message?: string
    actions?: ReactNode
}

export function Feedback({
    icon: Icon,
    media,
    tone = "neutral",
    title,
    message,
    actions,
    className,
    ...rest
}: FeedbackProps) {
    const error = tone === "error";

    return (
        <div
            className={cn("flex flex-col items-center justify-center px-4 py-12 text-center", className)}
            {...rest}
        >
            {Icon && 
                <div className={cn("mb-4 rounded-full p-3", error ? "bg-rust/10" : "bg-latte")}>
                    <Icon className={cn("size-6", error ? "text-rust" : "text-mocha")} />
                </div>
            }

            {media && <div className="mb-4 text-crema">{media}</div>}

            <h3 className="text-lg font-semibold">{title}</h3>
            
            {message && <p className="mt-1 max-w-sm text-sm text-mocha">{message}</p>}

            {actions && <div className="mt-4 flex gap-2">{actions}</div>}
        </div>
    )
}


type ErrorFeedbackProps = {
    message?: string
    title?: string
    onRetry?: () => void
    action?: ReactNode
    className?: string
}

export function ErrorFeedback({
    message = "Что-то пошло не так",
    title = "Ошибка",
    onRetry,
    action,
    className,
}: ErrorFeedbackProps) {
    return (
        <Feedback
            tone="error"
            icon={AlertTriangle}
            title={title}
            message={message}
            className={className}
            actions={
                (onRetry || action) && (
                <>
                    {onRetry && <Button onClick={onRetry}>Попробовать снова</Button>}
                    {action}
                </>
                )
            }
        />
    )
}


type LoadingFeedbackProps = {
    title?: string
    message?: string
    spinner?: ReactNode
    className?: string
}

export function LoadingFeedback({
    title = "Загружаем…",
    message,
    spinner = <BarsSpinner />,
    className,
}: LoadingFeedbackProps) {
    return (
        <Feedback
            media={spinner}
            title={title}
            message={message}
            className={className}
            aria-live="polite"
            aria-busy="true"
        />
    )
}