import type { PathTo } from "@/shared/lib/useForm/types" 
import { Button, Column, Row, Section, Text } from "@/shared/ui/layout"
import { FormField, Input } from "@/shared/ui/form"
import { CreateUsageForm } from "./create-usage-form"
import { useFormContext } from "@/shared/lib/useForm/useForm"
import { emptyUsage, type ProductDraft, type VariantDraft } from "./form-data"


type VariantFormProps = {
    path: PathTo<ProductDraft, VariantDraft>
    onVariantRemove: () => void
}

export function CreateVariantForm({ path, onVariantRemove }: VariantFormProps) {
    const { register, useFieldArray } = useFormContext<ProductDraft>().scope(path)

    const {
        fields: usages,
        append: addUsage,
        remove: removeUsage
    } = useFieldArray('uses')


    const onUsageAdd = () => addUsage(emptyUsage)
    const onUsageRemove = (i: number) => () => removeUsage(i)


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