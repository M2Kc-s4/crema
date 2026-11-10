import Elysia, { t, type Static } from "elysia";
import { authMacro } from "./shared";
import { getStockUseCase } from "@/applications/usecases/queries/get-stock";
import { reader, txm } from "@/composition";
import { restockIngridientUseCase } from "@/applications/usecases/commands/restock-ingridient";
import { createIngredientUseCase } from "@/applications/usecases/commands/create-igridient";
import { createProductUseCase } from "@/applications/usecases/commands/create-product";
import { getIngredientUseCase } from "@/applications/usecases/queries/get-ingredients";


const RestockRequest = t.Object({
    ingredientId: t.String(),
    qty: t.Numeric()
})

export type RestockRequest = Static<typeof RestockRequest>


const CreateIngredientRequest = t.Object({
    name: t.String()
})

export type CreateIngredientRequest = Static<typeof CreateIngredientRequest>


const CreateProductRequest = t.Object({
    name: t.String(),
    price: t.Numeric(),
    category: t.String(),
    options: t.Array(
        t.Object({
            name: t.String(),
            variants: t.Array(
                t.Object({
                    name: t.String(),
                    priceDelta: t.Numeric(),
                    uses: t.Array(
                        t.Object({
                            ingredientId: t.String(),
                            amount: t.Numeric(),
                        })
                    ),
                })
            ),
        })
    ),
})

export type CreateProductRequest = Static<typeof CreateProductRequest>


export const stockRoutes = new Elysia().use(authMacro)

.get('/stock',
    ({ userId }) => getStockUseCase({ userId }, reader),
    { auth: true }
)

.get('/ingredients',
    () => getIngredientUseCase(reader)
)

.post('/restock', 
    ({ userId, body }) => restockIngridientUseCase({...body, userId}, txm),
    {
        auth: true,
        body: RestockRequest
    }
)

.post('/ingredients', 
    ({ userId, body }) => createIngredientUseCase({...body, userId}, txm), 
    {
        auth: true,
        body: CreateIngredientRequest
    }
)

.post('/products',
    ({ userId, body }) => createProductUseCase({ ...body, userId }, txm),
    {
        auth: true,
        body: CreateProductRequest
    }
)