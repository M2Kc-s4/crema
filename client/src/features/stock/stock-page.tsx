import { useState } from "react";
import { useQuery } from "@/shared/lib/useQuery";
import { stockApi } from "./api";
import { ErrorFeedback, LoadingFeedback } from "@/shared/ui/feedback";
import { CreateIngredientDialog } from "./create-ingredient-dialog";
import { IngredientCard } from "./ingredient-card";
import { ProductCard } from "./product-card";
import { Button, Grid, Page, Row, Section, Text } from "@/shared/ui/layout";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/routes";


export function StockPage() {
    const [createIngredientDialogOpen, setCreateIngredientDialogOpen] = useState(false)
    const navigate = useNavigate()

    const { data: stock, error, isLoading } = useQuery(stockApi.getStock, { tags: "stock" })


    if (isLoading) return <LoadingFeedback />
    if (error) return <ErrorFeedback message={error.message} />

    const { ingredients, products } = stock

    const onNewProduct = () => navigate(ROUTES.createProduct)
    const onIngredientDialogOpen = () => setCreateIngredientDialogOpen(true)
    const onIngredientDialogClose = () => setCreateIngredientDialogOpen(false)


    return (
        <Page>
            {createIngredientDialogOpen &&
                <CreateIngredientDialog onClose={onIngredientDialogClose} />
            }

            <Text xl>Меню и остатки</Text>

            <Grid min={260} fit>
                <Section>
                    <Text md>Остатки</Text>

                    {ingredients.map(i => 
                        <IngredientCard ingredient={i} key={i.id} />
                    )}

                    <Button gold onClick={onIngredientDialogOpen}>
                        Добавить ингредиент
                    </Button>
                </Section>

                <Section>
                    <Text md>Позиции</Text>

                    {products.map(p => 
                        <ProductCard product={p} key={p.id} ingredients={ingredients}/>
                    )}
                    
                    <Button ghost onClick={onNewProduct}>
                        Новая позиция
                    </Button>
                </Section>
            </Grid>
        </Page>
    )
}