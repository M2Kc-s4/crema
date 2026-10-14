import { DomainError } from "./error"
import { randomUUIDv7 } from "bun"
import type { Branded } from "./lib"

export const ErrNotFound = new DomainError("Сущность не найдена")
export const ErrNegativePrice = new DomainError("Цена не может быть отрицательной")
export const ErrInvalidQty = new DomainError("Количество должно быть целым и больше нуля")
export const ErrEmptyName = new DomainError("Название не может быть пустым")



export type ID<T> = Branded<string, 'ID'> & { __for: T }

export function ID<T>(value: string) {
    return value as ID<T>
}

export namespace ID {
    export function generate<T>() {
        return randomUUIDv7() as ID<T>
    }
}


export type Price = Branded<number, "Price">

export function Price(number: number) {
    if (number < 0) throw ErrNegativePrice

    return number as Price
}


export type Quantity = Branded<number, "Quantity">

export function Quantity(number: number) {
    if (number < 0 || !Number.isInteger(number)) throw ErrInvalidQty

    return number as Quantity
}


export type Name = Branded<string, "Name">

export function Name(string: string) {
    if (string.length === 0) throw ErrEmptyName

    return string as Name
}
