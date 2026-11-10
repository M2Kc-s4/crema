import { useMutation, useQuery } from "@/shared/useQuery"
import { cartApi } from "./api"
import { User } from "domain/user"
import { Product } from "domain/product"
import { CartItemCard } from "./cart-item"
import { ErrorFeedback, LoadingFeedback } from "@/shared/ui/feedback"
import { useCurrentUser } from "@/app/providers/current-user-provider"
import { Button, Page, Row, Section, Spacer, Text } from "@/shared/ui/layout"

export function CartPage() {    
    const { updateCurrentUser } = useCurrentUser()

    const { data: cart, error } = useQuery({
        query: cartApi.getCart
    })

    const { mutate: placeOrder } = useMutation({
        mutation: cartApi.placeOrder,
        onSuccess() {
            updateCurrentUser()
        },
        onError(error) {
            alert(error.message)
        },
    })

    if (error) return <ErrorFeedback message={error.message} />
    if (!cart) return <LoadingFeedback />


    const sum = cart.reduce((prev, [cartItem, product]) => 
        prev + Product.calculateTotalPrice(product, cartItem.options), 0
    )


    return (
        <Page>
            <Text xl>Ваш заказ</Text>
            
            <Section>
                {cart.map(([item, product]) => 
                    <CartItemCard cartItem={item} product={product} key={User.getCartItemKey(item)}/>
                )}
                <Section dark>
                    <Row>
                        <Text bold>Итого {sum} ₽</Text>
                        <Spacer />
                        <Button onClick={placeOrder} gold >Оформить заказ</Button>
                    </Row>
                </Section>
            </Section>
        </Page>
    )
}