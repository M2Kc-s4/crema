import { DomainError } from "./error";
import type { Branded, Mutable } from "./lib";
import type { Option, Product, Variant } from "./product";
import { ID, Quantity } from "./shared";


export const ErrInvalidEmail = new DomainError("Невалидный формат почты")
export const ErrPasswordLength = new DomainError("Неверная длина пароля")
export const ErrBarmanCart = new DomainError("У баристы не может быть корзины")
export const ErrCartIsEmpty = new DomainError("Корзина пуста")
export const ErrForbidden = new DomainError("У вас нет прав на это действие")
export const ErrUnknownRole = new DomainError("Такой роли не существует")
export const ErrAuthFailed = new DomainError("Ошибка авторизации")
export const ErrEmailExists = new DomainError("Пользователь с таким email уже зарегистрирован")


export type PlainPassword = Branded<string, "PlainPassword">

export type HashedPassword = Branded<string, "HashedPassword">
export const PASSWORD_HASH_PLACEHOLDER = "PRIVATE" as HashedPassword


export const USER_ROLES = ['customer', 'barman'] as const
export type UserRole = typeof USER_ROLES[number]

export type Email = Branded<string, "Email">

export type CartItem = {
    id: ID<CartItem>
    productId: ID<Product>
    qty: Quantity
    options: Record<ID<Option>, ID<Variant>>
}

export type User = {
    id: ID<User>
    email: Email
    role: UserRole
    hashedPassword: HashedPassword
    cart: CartItem[] 
}



export function Email(plain: string) {
    if (!plain.includes("@")) throw ErrInvalidEmail

    return plain as Email
}

export function PlainPassword(plain: string) {
    if (plain.length < 4) throw ErrPasswordLength

    return plain as PlainPassword
}

export function UserRole(string: string) {
    if (!USER_ROLES.includes(string as any)) throw ErrUnknownRole

    return string as UserRole
}


export function CartItem(product: Product, qty: Quantity, options: Record<ID<Option>, ID<Variant>>): CartItem {
    return { productId: product.id, qty, options, id: ID.generate() }
}

export function User(email: Email, hashedPassword: HashedPassword, role: UserRole): User {
    return { id: ID.generate(), email, hashedPassword, role, cart: [] }
}



export namespace User {
    export function addToCart(user: Mutable<User>, product: Product, qty: Quantity, options: Record<ID<Option>, ID<Variant>>) {
        const newKey = getCartItemKey(product.id, options)

        const existing = user.cart.find(i => getCartItemKey(i.productId, i.options) === newKey)

        if (existing) {
            existing.qty = Quantity(existing.qty + qty)
        }
        else {
            const cartItem = CartItem(product, qty, options)

            user.cart.push(cartItem)
        }
    }

    export function removeFromCart(user: Mutable<User>, cartItemId: ID<CartItem>) {
        const cartItem = user.cart.find(i => i.id === cartItemId)
    
        if (!cartItem) return

        if (cartItem.qty === 1) {
            user.cart = user.cart.filter(i => i !== cartItem)
        }

        cartItem.qty = Quantity(cartItem.qty - 1)
    }

    export function clearCart(user: Mutable<User>) {
        user.cart = []
    }


    export function assertCartNotEmpty(user: User) {
        if (user.cart.length === 0) throw ErrCartIsEmpty
    }

    export function getCartItemKey(productId: ID<Product>, options: Record<ID<Option>, ID<Variant>>): string {
        const opts = Object.entries(options)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}=${v}`)
            .join("&")

        return `${productId}?${opts}`
    }

    export function isCustomer(user: User) {
        return user.role === 'customer'
    }

    export function isBarman(user: User) {
        return user.role === 'barman'
    }
}
