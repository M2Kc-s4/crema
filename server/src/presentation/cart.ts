import Elysia, { t, type Static } from "elysia";
import { authMacro } from "./shared";
import { getCartUseCase } from "@/applications/usecases/queries/get-cart";
import { reader, txm } from "@/composition";
import { addToCartUseCase } from "@/applications/usecases/commands/add-to-cart";
import { placeOrderUseCase } from "@/applications/usecases/commands/place-order";
import { removeFromCardUseCase } from "@/applications/usecases/commands/remove-from-cart";

export const cartRoutes = new Elysia().use(authMacro)



const AddToCartRequest = t.Object({
    productId: t.String(),
    qty: t.Numeric(),
    options: t.Record(t.String(), t.String())
})

export type AddToCartRequest = Static<typeof AddToCartRequest>


const RemoveFromCardRequest = t.Object({
    cartItemId: t.String()
})

export type RemoveFromCardRequest = Static<typeof RemoveFromCardRequest>


cartRoutes.get('/me/cart', 
    ({ userId }) => getCartUseCase({ userId }, reader), 
    {
        auth: true
    }
)

cartRoutes.post('/me/cart/add',
    ({ body, userId }) => addToCartUseCase({ ...body, userId }, txm),
    {
        auth: true,
        body: AddToCartRequest
    }
)

cartRoutes.post('/me/cart/place', 
    ({ userId }) => placeOrderUseCase({ userId }, txm),
    { auth: true }
)

cartRoutes.post('/me/cart/remove', 
    ({ userId, body }) => removeFromCardUseCase({ userId, ...body }, txm),
    { auth: true, body: RemoveFromCardRequest }
)