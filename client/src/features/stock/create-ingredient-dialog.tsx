import { useMutation } from "@/shared/useQuery";
import { stockApi } from "./api";
import { Form, FormActions, FormError, FormField, Input } from "@/shared/ui/form";
import { Button, Modal } from "@/shared/ui/layout";
import { createForm } from "@/shared/useForm";

type CreateIngredientDialogProps = {
    onClose: () => void
}

type Form = {
    name: string
}

const defaultValues: Form = {
    name: ''
}

const { useForm } = createForm(defaultValues)

export function CreateIngredientDialog({ onClose }: CreateIngredientDialogProps) {
    const { register, setError, formError: error, handleSubmit } = useForm()

    const { mutate: createIngredient } = useMutation({
        mutation: stockApi.createIngredient,
        refetches: 'stock',
        onSuccess() {
            onClose()
        },
        onError(error) {
            setError(error.message)
        }
    })


    const onSubmit = handleSubmit(createIngredient)


    return (
        <Modal title="Новый ингредиент" onClose={onClose}>
            <Form onSubmit={onSubmit}>
                <FormField label='Название'>
                    <Input {...register('name')} placeholder="Например, сироп карамельный" required />
                </FormField>

                <FormError error={error} />

                <FormActions>
                    <Button ghost onClick={onClose}>Отмена</Button>
                    <Button gold submit >Добавить</Button>
                </FormActions>
            </Form>
        </Modal>
    ) 
}