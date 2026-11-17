import { useMutation } from "@/shared/lib/useQuery"
import { Product, type Option, type Variant } from "domain/product"
import type { ID } from "domain/shared"
import { cartApi } from "./api"
import { useGuardedCurrentUser } from "@/app/providers/current-user-provider"
import { Button, Column, Modal, Text } from "@/shared/ui/layout"
import { Choice, Form, FormError, FormField, Input } from "@/shared/ui/form"
import { useForm } from "@/shared/lib/useForm/useForm"


type AddToCartDialogProps = {
    onClose: () => void
    product: Product
}


type Form = {
    qty: number
    options: Record<ID<Option>, ID<Variant>>
}

const defaultValues: Form = {
    qty: NaN,
    options: {}
}


export function AddToCartDialog({ onClose, product }: AddToCartDialogProps) {
    const { register, handleSubmit, formError, watch, setError } = useForm(defaultValues)

    const { updateCurrentUser } = useGuardedCurrentUser()

    const { mutate: addToCart } = useMutation(cartApi.addToCart, {
        onSuccess: updateCurrentUser,
        onError: setError,
    })


    const selected = watch('options')    
    const totalPrice = Product.calculateTotalPrice(product, selected)

    const onSubmit = handleSubmit(d => addToCart({...d, productId: product.id}))


    return (
        <Modal title={product.name} onClose={onClose}>
            <Form onSubmit={onSubmit}>
                {product.options.map(option => 
                    <Column key={option.id} gap={2}>
                        <Text bold>{option.name}:</Text>

                        {option.variants.map(variant =>
                            <Choice
                                {...register(`options.${option.id}`)}
                                value={variant.id}
                                key={variant.id}
                                required
                            >
                                <Text>{variant.name}</Text>
                                <Text>+{variant.priceDelta} ₽</Text>
                            </Choice>
                        )}
                    </Column>
                )}

                <FormField label="Количество:">
                    <Input {...register('qty')} type="number" required />
                </FormField>

                <FormError error={formError} /> 

                <Button gold submit>
                    Добавить в корзину за {totalPrice} ₽
                </Button>
            </Form>
        </Modal>
    )
}