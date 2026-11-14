import { Layers, PackageOpen } from "lucide-react"
import { ErrorFeedback, Feedback, LoadingFeedback } from "@/shared/ui/feedback"
import { Choice, Form, FormError, FormField, Input, Select } from "@/shared/ui/form"
import { Button, Column, Page, Row, Section, Spacer, Text } from "@/shared/ui/layout"
import { createForm } from "@/shared/useForm"
import { useMutation, useQuery } from "@/shared/useQuery"
import { CATEGORIES, Category, Option } from "domain/product"
import { useNavigate } from "react-router-dom"
import { ROUTES } from "@/app/routes"
import type { PathTo } from "@/shared/useForm/types"
import { CreateProductForm } from "./create-product-form"
import { useCreateProductForm, type OptionDraft, type ProductDraft } from "./form-data"
import { stockApi } from "../stock/api"




function useVM() {
    const { setError, FormProvider, handleSubmit } = useCreateProductForm()
    const navigate = useNavigate()

    const { mutate: createProduct } = useMutation({
        mutation: stockApi.createProduct,
        onSuccess() {
            navigate(ROUTES.stock)
        },
        onError: setError
    })

    const { data: ingredients, error } = useQuery({
        query: stockApi.getIngredients,
        key: "ingredients",
    })

    return {
        onSubmit: handleSubmit(createProduct),
        onCancel: () => navigate(-1),
        ingredients, error,
        FormProvider
    }
}


export function CreateProductPage() {
    const { ingredients, error, FormProvider, onCancel, onSubmit } = useVM()

    if (!ingredients) return error
        ?   <ErrorFeedback message={error.message} />
        :   <LoadingFeedback />

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