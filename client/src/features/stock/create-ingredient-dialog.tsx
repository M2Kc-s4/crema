import { useMutation } from "@/shared/lib/useQuery";
import { stockApi } from "./api";
import { Form, FormActions, FormError, FormField, Input } from "@/shared/ui/form";
import { Button, Modal } from "@/shared/ui/layout";
import { useForm } from "@/shared/lib/useForm/useForm";

type CreateIngredientDialogProps = {
    onClose: () => void
}

type Form = {
    name: string
}

const emptyForm: Form = {
    name: ''
}


export function CreateIngredientDialog({ onClose }: CreateIngredientDialogProps) {
    const { register, setError, formError, handleSubmit } = useForm(emptyForm)

    const { mutate: createIngredient } = useMutation(stockApi.createIngredient, {
        refetches: 'stock',
        onSuccess: onClose,
        onError: setError
    })


    const onSubmit = handleSubmit(createIngredient)


    return (
        <Modal title="Новый ингредиент" onClose={onClose}>
            <Form onSubmit={onSubmit}>
                <FormField label='Название'>
                    <Input {...register('name')} placeholder="Например, сироп карамельный" required />
                </FormField>

                <FormError error={formError} />

                <FormActions>
                    <Button ghost onClick={onClose}>Отмена</Button>
                    <Button gold submit >Добавить</Button>
                </FormActions>
            </Form>
        </Modal>
    ) 
}