import { ErrorFeedback, LoadingFeedback } from "@/shared/ui/feedback"
import { Form } from "@/shared/ui/form"
import { Button, Column, Page, Row, Spacer, Text } from "@/shared/ui/layout"
import { useMutation, useQuery } from "@/shared/lib/useQuery"
import { useNavigate } from "react-router-dom"
import { ROUTES } from "@/app/routes"
import { CreateProductForm } from "./create-product-form"
import { stockApi } from "../stock/api"
import { useForm } from "@/shared/lib/useForm/useForm"
import { emptyProduct } from "./form-data"



export function CreateProductPage() {
    const { setError, FormProvider, handleSubmit } = useForm(emptyProduct)
    const navigate = useNavigate()

    const { mutate: createProduct } = useMutation(stockApi.createProduct, {
        onSuccess: () => navigate(ROUTES.stock),
        onError: setError
    })

    const { data: ingredients, error, isLoading } = useQuery(stockApi.getIngredients, { key: "ingredients" })

    
    const onSubmit = handleSubmit(createProduct)
    const onCancel = () => navigate(-1)


    if (isLoading) return <LoadingFeedback />
    if (error) return <ErrorFeedback message={error.message} />

    if (!ingredients.length) return <ErrorFeedback message="Нет зарегистрированных ингредиентов" />


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
                    <CreateProductForm />
                </Form>
            </FormProvider>
        </Page>
    )
}