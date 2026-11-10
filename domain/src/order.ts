import { DomainError } from "./error"
import type { Mutable } from "./lib"
import { Product, Variant, Option } from "./product"
import { ID, Name, Price, Quantity } from "./shared"
import type { CartItem, User } from "./user"


export const ErrEmptyOrder = new DomainError("Заказ не может быть пустым")
export const ErrInvalidQty = new DomainError("Количество должно быть целым и больше нуля")
export const ErrProductMismatch = new DomainError("Позиция корзины относится к другому продукту")
export const ErrPickupInPast = new DomainError("Время получения уже прошло")
export const ErrAlreadyIssued = new DomainError("Заказ уже выдан")
export const ErrParallelOrders = new DomainError("Нельзя создать несколько заказов параллельно")
export const ErrOrderNotIssued = new DomainError("Нельзя забрать неготовый заказ")
export const ErrOrderAlreadyPickedUp = new DomainError("Нельзя дважды забрать один заказ")
export const ErrNoOpenedOrder = new DomainError("У вас нету открытых заказов")


export const ORDER_STATUSES = ["progress", "issued", "pickedUp"] as const
export type OrderStatus = typeof ORDER_STATUSES[number]


export type OrderItem = {
    productId: ID<Product>
    name: Name
    selection: Record<ID<Option>, ID<Variant>>
    unitPrice: Price
    qty: Quantity
}

export type Order = {
    id: ID<Order>
    userId: ID<User>
    status: OrderStatus
    items: OrderItem[]
    total: Price
    createdAt: string
    closed: boolean
}



export function OrderItem(product: Product, cartItem: CartItem): OrderItem {
    if (product.id !== cartItem.productId) throw ErrProductMismatch
    if (cartItem.qty <= 0) throw ErrInvalidQty

    return {
        productId: product.id,
        name: product.name,
        selection: { ...cartItem.options },
        unitPrice: Product.calculateTotalPrice(product, cartItem.options),
        qty: cartItem.qty
    }
}

export function Order(user: User, items: OrderItem[]): Order {
    if (items.length === 0) throw ErrEmptyOrder

    return {
        id: ID.generate(),
        userId: user.id,
        status: "progress",
        items,
        total: Price(items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0)),
        createdAt: new Date().toISOString(),
        closed: false
    }
}



export namespace Order {
    export function issue(order: Mutable<Order>) {
        if (order.status === "issued") throw ErrAlreadyIssued

        order.status = "issued"
    }

    export function pickUp(order: Mutable<Order>) {
        if (order.status === 'progress') throw ErrOrderNotIssued

        if (order.status === 'pickedUp') throw ErrOrderAlreadyPickedUp

        order.status = 'pickedUp'
    }

    export function close(order: Mutable<Order>) {
        order.closed = true
    }


    export function isIssued(order: Order) {
        return order.status === 'issued' || order.status === 'pickedUp'
    }

    export function isPickedUp(order: Order) {
        return order.status === 'pickedUp'
    }

    export function optionsLabel(item: OrderItem, product: Product): string {
        const opts = Product.resolveSelection(product, item.selection)
        return opts.map(o => o.variant.name).join(", ")
    }
}

