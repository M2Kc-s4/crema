import { Layers, PackageOpen } from "lucide-react"
import { ErrorFeedback, Feedback, LoadingFeedback } from "@/shared/ui/feedback"
import { Choice, Form, FormError, FormField, Input, Select } from "@/shared/ui/form"
import { Button, Column, Page, Row, Section, Spacer, Text } from "@/shared/ui/layout"
import { createForm } from "@/shared/useForm"
import { useMutation, useQuery } from "@/shared/useQuery"
import { stockApi } from "./api"
import { CATEGORIES, Category } from "domain/product"
import { useNavigate } from "react-router-dom"
import { ROUTES } from "@/app/routes"

type UsageDraft = {
    ingredientId: string
    amount: number
}

type VariantDraft = {
    name: string
    priceDelta: number
    uses: UsageDraft[]
}

type OptionDraft = {
    name: string
    variants: VariantDraft[]
}

type ProductDraft = {
    name:  string
    price: number
    category: string
    options: OptionDraft[]
} 

const emptyVariant: VariantDraft = {
    name: "",
    priceDelta: NaN,
    uses: []
}

const emptyOption: OptionDraft = {
    name: "",
    variants: [emptyVariant]
}

const emptyProduct: ProductDraft = {
    name: '',
    category: '',
    price: NaN,
    options: []
}

const emptyUsage: UsageDraft = {
    ingredientId: '',
    amount: NaN
}

const CATEGORIES_LABEL: Record<Category, string> = {
    coffee: "Кофе",
    pastries: "Выпечка",
    cold: "Холодное"
}

const { useForm, useFormContext } = createForm(emptyProduct)


export function CreateProductPage() {
    const { register, setError, formError, handleSubmit, useFieldArray, FormProvider } = useForm()
    const navigate = useNavigate()

    const {
        fields: options,
        append: addOption,
        remove: removeOption
    } = useFieldArray('options')

    const { mutate: createProduct } = useMutation({
        mutation: stockApi.createProduct,
        onSuccess() {
            navigate(ROUTES.stock)
        },
        onError: setError
    })

    const { data: ingredients, error: queryError } = useQuery({
        query: stockApi.getIngredients,
        key: "ingredients",
        staleTime: Infinity
    })

    if (!ingredients) return queryError
        ?   <ErrorFeedback message={queryError.message} />
        :   <LoadingFeedback />

    if (!ingredients.length) return <ErrorFeedback message="Нет зарегистрированных ингредиентов" />


    const onOptionAdd = () => addOption(emptyOption)
    const onOptionRemove = (i: number) => () => removeOption(i)
    const onSubmit = handleSubmit(createProduct)
    const onCancel = () => navigate(-1)
    

    return (
        <Page>
            <Row>
                <Column gap={1}>
                    <Text xl>Новая позиция</Text>
                    <Text muted sm>Заполни основные данные, затем добавь опции и расход ингредиентов</Text>
                </Column>
                <Spacer />
                <Button ghost onClick={onCancel}>Назад</Button>
            </Row>

            <FormProvider>
                <Form onSubmit={onSubmit}>
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
                                        <OptionForm
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
                </Form>
            </FormProvider>
        </Page>
    )
}


type OptionFormProps = {
    index: number
    path: `options.${number}`
    onOptionRemove: () => void
}

function OptionForm({ index, path, onOptionRemove }: OptionFormProps) {
    const { useFieldArray, register } = useFormContext(path)

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
                    <VariantForm
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


type VariantFormProps = {
    path: `options.${number}.variants.${number}`
    onVariantRemove: () => void
}

function VariantForm({ path, onVariantRemove }: VariantFormProps) {
    const { register, useFieldArray } = useFormContext(path)

    const {
        fields: uses,
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

            {uses.length > 0 &&
                <Column gap={2} className="border-l-2 border-line pl-3">
                    <Text muted sm>Расход ингредиентов</Text>
                    {uses.map((u, i) =>
                        <UsageForm
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


type UsageFormProps = {
    path: `options.${number}.variants.${number}.uses.${number}`
    onUsageRemove: () => void
}

function UsageForm({ path, onUsageRemove }: UsageFormProps) {
    const { register } = useFormContext(path)

    const { data: ingredients, error } = useQuery({
        query: stockApi.getIngredients,
        key: 'ingredients',
        staleTime: Infinity
    })

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
                <Input {...register('amount')} type="number" placeholder="кол-во" required />
            </FormField>
            <Button sm ghost onClick={onUsageRemove}>✕</Button>
        </Row>
    )
}