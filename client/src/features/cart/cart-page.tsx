import { useMutation, useQuery } from "@/shared/lib/useQuery"
import { cartApi } from "./api"
import { CartItem, User } from "domain/user"
import { Product } from "domain/product"
import { CartItemCard } from "./cart-item"
import { ErrorFeedback, LoadingFeedback } from "@/shared/ui/feedback"
import { useCurrentUser } from "@/app/providers/current-user-provider"
import { Button, Page, Row, Section, Spacer, Text } from "@/shared/ui/layout"

export function CartPage() {    
    const { updateCurrentUser } = useCurrentUser()

    const { data: cart, error, isLoading } = useQuery(cartApi.getCart, {
        tags: 'cart'
    })

    const { mutate: placeOrder, isPending: isPlacing } = useMutation(cartApi.placeOrder, {
        onSuccess: updateCurrentUser,
        onError(error) {
            alert(error.message)
        },
    })

    const { mutate: removeFromCard } = useMutation(cartApi.removeFromCard, {
        onSuccess: updateCurrentUser,
        refetches: "cart"
    })

    
    if (isLoading) return <LoadingFeedback />
    if (error) return <ErrorFeedback message={error.message} />


    const sum = cart.reduce((prev, [cartItem, product]) => 
        prev + Product.calculateTotalPrice(product, cartItem.options) * cartItem.qty, 0
    )
    
    const onItemRemove = (item: CartItem) => () => removeFromCard({cartItemId: item.id})


    return (
        <Page>
            <Text xl>Ваш заказ</Text>
            
            <Section>
                {cart.map(([item, product]) => 
                    <CartItemCard 
                        cartItem={item} 
                        product={product} 
                        key={User.getCartItemKey(item.productId, item.options)}
                        onRemove={onItemRemove(item)}
                        options={item.options}
                    />
                )}
                <Section dark>
                    <Row>
                        <Text bold>Итого {sum} ₽</Text>
                        <Spacer />
                        <Button onClick={placeOrder} loading={isPlacing} gold >Оформить заказ</Button>
                    </Row>
                </Section>
            </Section>
        </Page>
    )
}