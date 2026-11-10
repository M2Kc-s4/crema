import { Section, Text } from "@/shared/ui/layout";
import type { Product } from "domain/product";

const TONES = ["#8A5A3C", "#B88A5E", "#D2B48C", "#4A2E22", "#C9964F", "#E0B87A", "#A06A3A"]

export function toneFor(key: string): string {
    let h = 0
    for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0
    return TONES[h % TONES.length]!
}

type ProductCardProps = {
    product: Product
    onSelect: () => void
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
    return (
        <Section onClick={onSelect}>
            <div
                className="mb-1.5 size-21 rounded-full"
                style={{
                    background: `radial-gradient(circle at 35% 30%, #F3E9DC 0 12%, ${toneFor(product.id)} 55%)`,
                }}
            />

            <Text md>{product.name}</Text>
            <Text sm >{product.name}</Text>
            <Text bold >от {product.price} ₽</Text>
        </Section>
    )
}