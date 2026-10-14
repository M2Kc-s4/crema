export function getKeys<T extends object>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[]
}

export function getEntries<K extends string | number | symbol, V>(obj: Record<K, V>): [K, V][] {
    return Object.entries(obj) as [K, V][]
}

export function fromEntries<K extends string | number, V>(entries: [K, V][]): Record<K, V> {
    return Object.fromEntries(entries) as Record<K, V>
}

export type Branded<T, B extends string> = T & { __brand: B }

export type Mutable<T> = Branded<T, "Mutable">