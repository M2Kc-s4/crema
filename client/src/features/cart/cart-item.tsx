import { Box, Button, Row, Text } from "@/shared/ui/layout";
import { Product } from "domain/product";
import type { CartItem } from "domain/user";

type CartItemCardProps = {
    cartItem: CartItem
    product: Product,
    onRemove: () => void
}

export function CartItemCard({ cartItem, onRemove, product }: CartItemCardProps) {
    const opts = Product.resolveSelection(product, cartItem.options) 

    return (
        <Row line>
            <Box>
                <Text>{product.name} </Text>
                <Text muted >{opts.map(o => o.variant.name).join(', ') || "Без добавок"}</Text>
            </Box>
            <Text>{cartItem.qty} × {product.price} ₽</Text>
            <Button onClick={onRemove} sm >Убрать</Button>
        </Row>
    )
}