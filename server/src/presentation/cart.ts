import Elysia, { t, type Static } from "elysia";
import { authMacro } from "./shared";
import { getCartUseCase } from "@/applications/usecases/queries/get-cart";
import { reader, txm } from "@/composition";
import { addToCartUseCase } from "@/applications/usecases/commands/add-to-card";
import { placeOrderUseCase } from "@/applications/usecases/commands/place-order";

export const cartRoutes = new Elysia().use(authMacro)

cartRoutes.get('/cart', 
    ({ userId }) => getCartUseCase({ userId }, reader), 
    {
        auth: true
    }
)


const AddToCartRequest = t.Object({
    productId: t.String(),
    qty: t.Numeric(),
    options: t.Record(t.String(), t.String())
})

export type AddToCartRequest = Static<typeof AddToCartRequest>

cartRoutes.post('/me/add-to-cart',
    ({ body, userId }) => addToCartUseCase({ ...body, userId }, txm),
    {
        auth: true,
        body: AddToCartRequest
    }
)


cartRoutes.post('/me/place-order', 
    ({ userId }) => placeOrderUseCase({ userId }, txm),
    { auth: true }
)