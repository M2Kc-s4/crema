import { useNavigate } from "react-router-dom"
import { emptyOption, useCreateProductForm, useCreateProductFormContext } from "./form-data"
import { Choice, Form, FormError, FormField, Input } from "@/shared/ui/form"
import { useMutation, useQuery } from "@/shared/useQuery"
import { ROUTES } from "@/app/routes"
import { stockApi } from "../stock/api"
import { Button, Column, Row, Section, Spacer, Text } from "@/shared/ui/layout"
import { CATEGORIES, Category } from "domain/product"
import { Feedback } from "@/shared/ui/feedback"
import { Layers } from "lucide-react"
import { CreateOptionForm } from "./create-option-form"


const CATEGORIES_LABEL: Record<Category, string> = {
    coffee: "Кофе",
    pastries: "Выпечка",
    cold: "Холодное"
}


function useVM() {
    const { register, setError, formError,useFieldArray } = useCreateProductFormContext()
    const navigate = useNavigate()

    const {
        fields: options,
        append: addOption,
        remove: removeOption
    } = useFieldArray('options')

    return {
        onOptionAdd: () => addOption(emptyOption),
        onOptionRemove: (i: number) => () => removeOption(i),
        onCancel: () => navigate(-1),
        register, formError,
        options
    }
}


export function CreateProductForm() {
    const { register, onCancel, onOptionAdd, onOptionRemove, options, formError } = useVM()

    return (
        <>
            <Section>
                <Text md>Основное</Text>

                <Row align="start" wrap>
                    <FormField label="Название:" className="flex-4">
                        <Input {...register('name')} placeholder="название" required />
                    </FormField>

                    <FormField label="Базовая цена:" className="flex-1">
                        <Input {...register('price')} type="number" placeholder="цена, ₽" required />
                    </FormField>
                </Row>

                <FormField label="Категория:" radio>
                    <Row wrap>
                        {CATEGORIES.map(c =>
                            <Choice {...register('category')} key={c} value={c} required>
                                {CATEGORIES_LABEL[c]}
                            </Choice>
                        )}
                    </Row>
                </FormField>
            </Section>

            <Section>
                <Row>
                    <Text md>Опции</Text>
                    <Spacer />
                    {options.length > 0 &&
                        <Button sm onClick={onOptionAdd}>+ Опция</Button>
                    }
                </Row>

                {options.length 
                    ?   <Column>
                            {options.map((o, i) => (
                                <CreateOptionForm
                                    key={o.id}
                                    index={i}
                                    path={`options.${i}`}
                                    onOptionRemove={onOptionRemove(i)}
                                />
                            ))}
                        </Column>
                    :   <Feedback
                            icon={Layers}
                            title="Опций пока нет"
                            message="Например: «Размер»"
                            actions={
                                <Button gold onClick={onOptionAdd}>+ Добавить опцию</Button>
                            }
                        />
                }
            </Section>

            <FormError error={formError} />

            <Row justify="end">
                <Button ghost onClick={onCancel}>Отмена</Button>
                <Button gold submit>Создать позицию</Button>
            </Row>
        </>
    )
}