import type { Order, OrderItem } from "./order"
import { Price } from "./shared"


export const FREE_EVERY = 10

const isCoffee = (item: OrderItem) => item.category === "coffee"


export namespace Loyalty {
    export function countCupsIn(items: OrderItem[]): number {
        return items
            .filter(isCoffee)
            .reduce((sum, i) => sum + i.qty, 0)
    }

    export function countCups(orders: Order[]): number {
        return countCupsIn(orders.flatMap(o => o.items))
    }

    export function untilNextFree(cupsBefore: number): number {
        return FREE_EVERY - (cupsBefore % FREE_EVERY)
    }

    export function calculateDiscount(items: OrderItem[], cupsBefore: number): Price {
        const prices = items
            .filter(isCoffee)
            .flatMap(i => Array<number>(i.qty).fill(i.unitPrice))
            .sort((a, b) => a - b)

        const free = freeCups(cupsBefore, prices.length)

        return Price(prices.slice(0, free).reduce((sum, p) => sum + p, 0))
    }


    function freeCups(cupsBefore: number, cupsInOrder: number): number {
        return Math.floor((cupsBefore + cupsInOrder) / FREE_EVERY) - Math.floor(cupsBefore / FREE_EVERY)
    }
}