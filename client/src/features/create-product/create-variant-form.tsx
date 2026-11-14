import type { PathTo } from "@/shared/useForm/types"
import { emptyUsage, useCreateProductFormContext, type ProductDraft, type VariantDraft } from "./form-data"
import { Button, Column, Row, Section, Text } from "@/shared/ui/layout"
import { FormField, Input } from "@/shared/ui/form"
import { CreateUsageForm } from "./create-usage-form"

function useVariantFormVM(path: PathTo<ProductDraft, VariantDraft>) {
    const { register, useFieldArray } = useCreateProductFormContext(path)

    const {
        fields: usages,
        append: addUsage,
        remove: removeUsage
    } = useFieldArray('uses')

    return {
        register, usages,
        onUsageAdd: () => addUsage(emptyUsage),
        onUsageRemove: (i: number) => () => removeUsage(i)
    }
}


type VariantFormProps = {
    path: PathTo<ProductDraft, VariantDraft>
    onVariantRemove: () => void
}

export function CreateVariantForm({ path, onVariantRemove }: VariantFormProps) {
    const { register, usages, onUsageAdd, onUsageRemove } = useVariantFormVM(path)

    return (
        <Section sm>
            <Row>
                <FormField label='Вариант:' className="flex-3">
                    <Input {...register('name')} placeholder="название варианта" required />
                </FormField>

                <FormField label="Доплата:">
                    <Input {...register('priceDelta')} type="number" placeholder="+ ₽" required />
                </FormField>
                <Button sm ghost onClick={onVariantRemove}>✕</Button>
            </Row>

            {usages.length > 0 &&
                <Column gap={2} className="border-l-2 border-line pl-3">
                    <Text muted sm>Расход ингредиентов</Text>
                    {usages.map((u, i) =>
                        <CreateUsageForm
                            key={u.id}
                            path={`${path}.uses.${i}`}
                            onUsageRemove={onUsageRemove(i)}
                        />
                    )}
                </Column>
            }

            <Row>
                <Button sm link onClick={onUsageAdd}>+ Ингредиент</Button>
            </Row>
        </Section>
    )
}