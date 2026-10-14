import { DomainError } from "./error"
import { ID, Name, Price, Quantity } from "./shared";
import type { Ingredient } from "./ingridient";
import { getEntries, type Mutable } from "./lib";


export const ErrUnknownOption = new DomainError("Опция не найдена в продукте")
export const ErrUnknownVariant = new DomainError("Вариант не найден в опции")
export const ErrUnknownCategory = new DomainError("Такой категории не существует")
export const ErrEmptyOption = new DomainError("У опции должен остаться хотя бы один вариант")
export const ErrEmptyName = new DomainError("Название не может быть пустым")


const categories = ["coffee", "cold", "pastries"] as const
export type Category = typeof categories[number]

export type IngredientUsage = {
    ingridientId: ID<Ingredient>
    qty: Quantity
}

export type Variant = {
    id: ID<Variant>
    name: Name
    uses: IngredientUsage[]
    priceDelta: number
}

export type Option = {
    id: ID<Option>
    name: Name
    variants: Variant[]
}

export type Product = {
    id: ID<Product>
    name: Name
    price: Price
    category: Category
    options: Option[]
}


export function IngredientUsage(ingridientId: ID<Ingredient>, qty: Quantity): IngredientUsage {
    return { ingridientId, qty }
}

export function Variant(name: Name, priceDelta: number, uses: IngredientUsage[]): Variant {
    return { name, priceDelta, uses, id: ID.generate() }
}

export function Option(name: Name, variants: Variant[]): Option {
    return { id: ID.generate(), name, variants }
}

export function Category(s: string): Category {
    if (!categories.includes(s as any)) throw ErrUnknownCategory
    
    return s as Category
}

export function Product(name: Name, price: Price, category: Category, options: Option[]): Product {
    return { name, price, category, options, id: ID.generate()}
}


export namespace Product {
    export function getOption(product: Product, optionId: ID<Option>): Option {
        const option = product.options.find(o => o.id === optionId)
        if (!option) throw ErrUnknownOption

        return option
    }


    export function getVariant(option: Option, variantId: ID<Variant>): Variant {
        const variant = option.variants.find(v => v.id === variantId)
        if (!variant) throw ErrUnknownVariant

        return variant
    }


    export function resolveSelection(product: Product, selection: Record<ID<Option>, ID<Variant>>) {
        return getEntries(selection).map(([optionId, variantId]) => {
            const option = getOption(product, optionId)

            const variant = getVariant(option, variantId)

            return {option, variant} as const
        })
    }


    export function assertSelectionValid(product: Product, selection: Record<ID<Option>, ID<Variant>>) {
        getEntries(selection).forEach(([optionId, variantId]) => {
            const option = getOption(product, optionId)

            getVariant(option, variantId)
        })
    }


    export function calculateTotalPrice(product: Product, selection: Record<ID<Option>, ID<Variant>>) {
        let price = product.price

        for (const { variant } of resolveSelection(product, selection)) {
            price = Price(price + variant.priceDelta)
        }

        return price
    }


    export function calculateIngridientUsage(
        product: Product,
        selection: Record<ID<Option>, ID<Variant>>,
        qty: number,
    ) {
        const usage: Record<ID<Ingredient>, number> = {}

        for (const { variant }  of resolveSelection(product, selection)) {
            for (const { ingridientId, qty: count } of variant.uses) {
                usage[ingridientId] = (usage[ingridientId] ?? 0) + (count * qty)
            }
        }

        return usage
    }


    export function isVariantAvailable(variant: Variant, stock: ReadonlyMap<ID<Ingredient>, number>): boolean {
        return variant.uses.every(u => (stock.get(u.ingridientId) ?? 0) >= u.qty)
    }


    export function canPrepare(
        product: Product,
        selection: Record<ID<Option>, ID<Variant>>,
        qty: number,
        stock: ReadonlyMap<ID<Ingredient>, number>,
    ): boolean {

        for (const [id, needed] of getEntries(calculateIngridientUsage(product, selection, qty))) {
            if ((stock.get(id) ?? 0) < needed) return false
        }

        return true
    }
}

