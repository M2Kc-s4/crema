import { useMutation } from "@/shared/useQuery";
import type { Ingredient } from "domain/ingridient";
import { stockApi } from "./api";
import { Form, FormActions, FormError, FormField, Input } from "@/shared/ui/form";
import { Button, Modal } from "@/shared/ui/layout";
import { createForm } from "@/shared/useForm";
type RestockDialogProps = {
    ingredient: Ingredient
    onClose: () => void
}

type RestockDraft = {
    qty: number
}

const emptyRestock: RestockDraft = {
    qty: NaN
}

const { useForm } = createForm(emptyRestock)

export function RestockDialog({ ingredient, onClose }: RestockDialogProps) {
    const { register, setError, handleSubmit, formError: error } = useForm()

    const { mutate: restock, isPending: loading } = useMutation({
        mutation: stockApi.restockIngredient,
        refetches: "stock",
        onSuccess() {
            onClose()
        },
        onError(error) {
            setError(error.message)
        }
    })

    const onSubmit = handleSubmit(data => restock({...data, ingredientId: ingredient.id}))

    return (
        <Modal title={`Записать поставку ингридиента ${ingredient.name}`} onClose={onClose} wide>
            <Form onSubmit={onSubmit}>
                <FormField label="Количество" >
                    <Input {...register('qty')} placeholder="кол-во" type="number" required />
                </FormField>

                <FormError error={error} />

                <FormActions>
                    <Button ghost onClick={onClose}>Отмена</Button>
                    <Button loading={loading} gold submit>Записать поставку</Button>
                </FormActions>
            </Form>
        </Modal>
    )
}