import { Column, Row, Text } from "@/shared/ui/layout";
import type { Product } from "domain/product";


type ProductCardProps = {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <Row line>
            <Text>{product.name}</Text>
            <Text muted>
                {product.price} ₽
            </Text>
        </Row>
    )
}