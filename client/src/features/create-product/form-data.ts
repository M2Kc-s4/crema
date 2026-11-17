export type UsageDraft = {
    ingredientId: string
    qty: number
}

export type VariantDraft = {
    name: string
    priceDelta: number
    uses: UsageDraft[]
}

export type OptionDraft = {
    name: string
    variants: VariantDraft[]
}

export type ProductDraft = {
    name:  string
    price: number
    category: string
    options: OptionDraft[]
} 

export const emptyVariant: VariantDraft = {
    name: "",
    priceDelta: NaN,
    uses: []
}

export const emptyOption: OptionDraft = {
    name: "",
    variants: [emptyVariant]
}

export const emptyProduct: ProductDraft = {
    name: '',
    category: '',
    price: NaN,
    options: []
}

export const emptyUsage: UsageDraft = {
    ingredientId: '',
    qty: NaN
}
