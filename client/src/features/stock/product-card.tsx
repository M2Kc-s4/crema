import { useState } from "react"
import { Column, Modal, Row, Section, Spacer, Text } from "@/shared/ui/layout"
import type { Ingredient } from "domain/ingridient"
import type { Option, Product, Variant } from "domain/product"


type ProductCardProps = {
    product: Product
    ingredients: Ingredient[]
}


export function ProductCard({ product, ingredients }: ProductCardProps) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Row as="button" line className="w-full text-left" onClick={() => setOpen(true)}>
                <Text>{product.name}</Text>
                <Text muted>
                    {product.price} ₽
                </Text>
            </Row>

            {open && (
                <Modal title={product.name} wide onClose={() => setOpen(false)}>
                    <Text muted>Базовая цена: {product.price} ₽</Text>

                    {product.options.length === 0 && <Text muted>Опций нет</Text>}

                    {product.options.map(option => (
                        <OptionBlock key={option.id} option={option} ingredients={ingredients} />
                    ))}
                </Modal>
            )}
        </>
    )
}


function OptionBlock({ option, ingredients }: { option: Option, ingredients: Ingredient[] }) {
    return (
        <Column gap={2}>
            <Text bold>{option.name}</Text>

            {option.variants.map(variant => (
                <VariantBlock key={variant.id} variant={variant} ingredients={ingredients} />
            ))}
        </Column>
    )
}


function VariantBlock({ variant, ingredients }: { variant: Variant, ingredients: Ingredient[] }) {
    return (
        <Section dark sm>
            <Row>
                <Text bold>{variant.name}</Text>
                <Spacer />
                {variant.priceDelta !== 0 && (
                    <Text sm muted>{variant.priceDelta > 0 ? "+" : ""}{variant.priceDelta} ₽</Text>
                )}
            </Row>

            {variant.uses.length === 0 && <Text sm muted>Ингредиенты не используются</Text>}

            {variant.uses.map(use => (
                <Row key={use.ingridientId}>
                    <Text sm>{ingredients.find(i => i.id === use.ingridientId)?.name ?? "Неизвестный ингредиент"}</Text>
                    <Spacer />
                    <Text sm muted>{use.qty}</Text>
                </Row>
            ))}
        </Section>
    )
}