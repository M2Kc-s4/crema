import type { PathTo } from "@/shared/useForm/types"
import { emptyVariant, useCreateProductFormContext, type OptionDraft, type ProductDraft } from "./form-data"
import { Button, Column, Row, Section, Text } from "@/shared/ui/layout"
import { Input } from "@/shared/ui/form"
import { CreateVariantForm } from "./create-variant-form"

function useOptionFormVM(path: PathTo<ProductDraft, OptionDraft>) {
    const { useFieldArray, register } = useCreateProductFormContext(path)

    const {
        fields: variants,
        append: addVariant,
        remove: removeVariant
    } = useFieldArray('variants')

    return {
        register, variants,
        onVariantAdd: () => addVariant(emptyVariant),
        onVariantRemove: (i: number) => () => removeVariant(i)
    }
}


type OptionFormProps = {
    index: number
    path: PathTo<ProductDraft, OptionDraft>
    onOptionRemove: () => void
}

export function CreateOptionForm({ index, path, onOptionRemove }: OptionFormProps) {
    const { register, onVariantAdd, onVariantRemove, variants } = useOptionFormVM(path)

    return (
        <Section dark>
            <Row>
                <Text muted bold>#{index + 1}</Text>
                <Input {...register('name')} placeholder="название опции" required />
                <Button sm ghost onClick={onOptionRemove}>Удалить</Button>
            </Row>

            <Column>
                {variants.map((v, i) =>
                    <CreateVariantForm
                        key={v.id}
                        path={`${path}.variants.${i}`}
                        onVariantRemove={onVariantRemove(i)}
                    />
                )}
            </Column>

            <Row>
                <Button sm onClick={onVariantAdd}>+ Вариант</Button>
            </Row>
        </Section>
    )
}