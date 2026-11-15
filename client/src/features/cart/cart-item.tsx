import { Box, Button, Row, Text } from "@/shared/ui/layout";
import { Option, Product, Variant } from "domain/product";
import type { ID } from "domain/shared";
import type { CartItem } from "domain/user";

type CartItemCardProps = {
    cartItem: CartItem
    product: Product
    onRemove: () => void
    options: Record<ID<Option>, ID<Variant>>
}

export function CartItemCard({ cartItem, onRemove, product, options }: CartItemCardProps) {
    const opts = Product.resolveSelection(product, cartItem.options) 

    return (
        <Row line>
            <Box>
                <Text>{product.name} </Text>
                <Text muted >{opts.map(o => o.variant.name).join(', ') || "Без добавок"}</Text>
            </Box>
            <Text>{cartItem.qty} × {Product.calculateTotalPrice(product, options)} ₽</Text>
            <Button onClick={onRemove} sm >Убрать</Button>
        </Row>
    )
}