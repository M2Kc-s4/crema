import type { PathTo } from "@/shared/useForm/types"
import { useCreateProductFormContext, type ProductDraft, type UsageDraft } from "./form-data"
import { useQuery } from "@/shared/useQuery"
import { stockApi } from "../stock/api"
import { ErrorFeedback, LoadingFeedback } from "@/shared/ui/feedback"
import { Button, Row } from "@/shared/ui/layout"
import { FormField, Input, Select } from "@/shared/ui/form"

function useUsageFormVM(path: PathTo<ProductDraft, UsageDraft>) {
    const { register } = useCreateProductFormContext(path)

    const { data: ingredients, error } = useQuery({
        query: stockApi.getIngredients,
        key: 'ingredients',
        staleTime: Infinity
    })

    return {
        ingredients, error, register
    }
}


type UsageFormProps = {
    path: PathTo<ProductDraft, UsageDraft>
    onUsageRemove: () => void
}

export function CreateUsageForm({ path, onUsageRemove }: UsageFormProps) {
    const { ingredients, register, error } = useUsageFormVM(path)

    if (!ingredients) return error
        ?   <ErrorFeedback message={error.message} />
        :   <LoadingFeedback />

    return (
        <Row>
            <FormField label="Ингредиент:" className="flex-3">
                <Select {...register('ingredientId')} required defaultValue="">
                    <option value="" disabled>ингредиент</option>
                    {ingredients.map(i =>
                        <option key={i.id} value={i.id}>{i.name}</option>
                    )}
                </Select>
            </FormField>

            <FormField label="Количество:">
                <Input {...register('qty')} type="number" placeholder="кол-во" required />
            </FormField>
            <Button sm ghost onClick={onUsageRemove}>✕</Button>
        </Row>
    )
}