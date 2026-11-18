import type { IReader } from "@/applications/ports/ipersistance"
import { DomainError } from "domain/error"
import type { Ingredient } from "domain/ingridient"
import { getEntries } from "domain/lib"
import { Order, type OrderItem } from "domain/order"
import { Product } from "domain/product"
import { ErrNotFound, ID, type Name } from "domain/shared"
import { ErrForbidden, User } from "domain/user"
import { Bind } from "fluent-future"

const TOP_PRODUCTS_LIMIT = 5


type Command = {
    userId: string
}

export type ProductSales = {
    productId: ID<Product>
    name: Name
    qty: number
}

export type IngredientConsumption = {
    ingredientId: ID<Ingredient>
    qty: number
}

type Stats = {
    ordersCount: number
    revenue: number
    averageCheck: number
    topProducts: ProductSales[]
    consumption: IngredientConsumption[]
}

export type Statistics = {
    stats: Stats,
    ingredients: Ingredient[]
}


export async function getStatsUseCase(cmd: Command, reader: IReader) {
    const user = await reader.users.getByID(ID<User>(cmd.userId))
    if (!user) throw ErrNotFound

    if (!User.isBarman(user)) throw ErrForbidden


    const { orders, products, ingredients } = await Bind({
        orders: reader.orders.getAll(),
        products: reader.products.getAll(),
        ingredients: reader.ingredients.getAll(),
    })

    return {
        stats: calculateStats(orders, products),
        ingredients,
    }
}

function calculateStats(orders: readonly Order[], products: readonly Product[]): Stats {
    const done = orders.filter(Order.isIssued)
    const productById = new Map(products.map(p => [p.id, p]))

    const sales = new Map<ID<Product>, ProductSales>()
    const usage = new Map<ID<Ingredient>, number>()

    for (const order of done) {
        for (const item of order.items) {
            const sale = sales.get(item.productId) ?? { productId: item.productId, name: item.name, qty: 0 }
            sale.qty += item.qty
            sales.set(item.productId, sale)

            const product = productById.get(item.productId)
            if (!product) continue

            for (const [ingredientId, qty] of usageOf(product, item)) {
                usage.set(ingredientId, (usage.get(ingredientId) ?? 0) + qty)
            }
        }
    }

    const revenue = done.reduce((sum, o) => sum + o.total, 0)

    return {
        ordersCount: done.length,
        revenue,
        averageCheck: done.length ? revenue / done.length : 0,
        topProducts: [...sales.values()]
            .sort((a, b) => b.qty - a.qty)
            .slice(0, TOP_PRODUCTS_LIMIT),
        consumption: [...usage.entries()]
            .map(([ingredientId, qty]) => ({ ingredientId, qty }))
            .sort((a, b) => b.qty - a.qty),
    }
}


function usageOf(product: Product, item: OrderItem) {
    return getEntries(Product.calculateIngridientUsage(product, item.selection, item.qty))
}
