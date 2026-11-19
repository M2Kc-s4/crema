import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

export type Result<T, E = Error> =
    | { ok: true; value: T }
    | { ok: false; error: E }

export function attempt<T>(fn: () => T): Result<T, unknown> {
    try {
        return { ok: true, value: fn() }
    } catch (e) {
        return { ok: false, error: e }
    }
}

export function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
    })
}


export function formatDate(iso: string) {
    return new Date(iso).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })
}

const relativeFormat = new Intl.RelativeTimeFormat("ru", { numeric: "auto" })

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000],
]

export function formatAgo(iso: string) {
    const diff = Math.min(0, new Date(iso).getTime() - Date.now())

    for (const [unit, ms] of UNITS) {
        if (Math.abs(diff) >= ms) return relativeFormat.format(Math.round(diff / ms), unit)
    }

    return "только что"
}



const twMerge = extendTailwindMerge({
    extend: {
        theme: {
            color: ["espresso", "roast", "mocha", "crema", "milk", "foam", "rust", "latte", "oat", "track", "line", "line-soft"],
        },
    },
})

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))