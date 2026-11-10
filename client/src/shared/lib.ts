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


const twMerge = extendTailwindMerge({
    extend: {
        theme: {
            color: ["espresso", "roast", "mocha", "crema", "milk", "foam", "rust", "latte", "oat", "track", "line", "line-soft"],
        },
    },
})

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))