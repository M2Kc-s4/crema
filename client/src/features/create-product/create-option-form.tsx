import type { PathTo } from "@/shared/lib/useForm/types"
import { Button, Column, Row, Section, Text } from "@/shared/ui/layout"
import { Input } from "@/shared/ui/form"
import { CreateVariantForm } from "./create-variant-form"
import { emptyVariant, type OptionDraft, type ProductDraft } from "./form-data"
import { useFormContext } from "@/shared/lib/useForm/useForm"


type OptionFormProps = {
    index: number
    path: PathTo<ProductDraft, OptionDraft>
    onOptionRemove: () => void
}

export function CreateOptionForm({ index, path, onOptionRemove }: OptionFormProps) {
    const { useFieldArray, register } = useFormContext<ProductDraft>().scope(path)

    const {
        fields: variants,
        append: addVariant,
        remove: removeVariant
    } = useFieldArray('variants')


    const onVariantAdd = () => addVariant(emptyVariant)
    const onVariantRemove = (i: number) => () => removeVariant(i)


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