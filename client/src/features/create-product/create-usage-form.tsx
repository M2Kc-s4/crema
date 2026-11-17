import type { PathTo } from "@/shared/lib/useForm/types"
import { useQuery } from "@/shared/lib/useQuery"
import { stockApi } from "../stock/api"
import { ErrorFeedback, LoadingFeedback } from "@/shared/ui/feedback"
import { Button, Row } from "@/shared/ui/layout"
import { FormField, Input, Select } from "@/shared/ui/form"
import type { ProductDraft, UsageDraft } from "./form-data"
import { useFormContext } from "@/shared/lib/useForm/useForm"


type UsageFormProps = {
    path: PathTo<ProductDraft, UsageDraft>
    onUsageRemove: () => void
}

export function CreateUsageForm({ path, onUsageRemove }: UsageFormProps) {
    const { register } = useFormContext<ProductDraft>().scope(path)

    const { data: ingredients, error, isLoading } = useQuery(stockApi.getIngredients, {
        key: 'ingredients',
        staleTime: Infinity
    })

    if (isLoading) return <LoadingFeedback />
    if (error) return <ErrorFeedback message={error.message} />

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